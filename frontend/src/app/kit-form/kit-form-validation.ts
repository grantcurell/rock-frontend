import {  FormArray, AbstractControl } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { ServerFormGroup, SensorFormGroup, SensorsFormArray, ServersFormArray } from './kit-form';
import { GetClusteredStorageValidated, GetElasticSearchValidated, GetSensorResourcesValidated } from './kit-form-globals';
import { CEPH_DRIVE_MIN_COUNT } from '../frontend-constants';


function _validateMasterServer(control: AbstractControl, errors: Array<string>){
    let servers = control.get('servers') as ServersFormArray;
    if (servers != null){
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;
            if  (server.is_master_server.value){
                return;
            }
        }
    }
    errors.push("- Master server failed to validate. Did you remember to select a master server? (It's the checkbox that says 'Is Kubernetes master server?')");
}

function _validateCephDriveCount(control: AbstractControl, errors: Array<string>){
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;
    let ceph_drive_count = 0;

    if (servers != null) {
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;
            ceph_drive_count += server.ceph_drives.length;
        }
    }

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            ceph_drive_count += sensor.ceph_drives.length;
        }
    }
    
    if (ceph_drive_count < CEPH_DRIVE_MIN_COUNT){
        errors.push("- Ceph drives failed to validate. You have to have at least two drives in your Ceph cluster!");
    }    
}
  
function _validateMonitorInterfaces(control: AbstractControl, errors: Array<string>){
    let sensors = control.get('sensors') as SensorsFormArray;
    let error_message = "- Monitor interfaces failed to validate. You need to select at least one monitor interface on each sensor.";    

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if (sensor.monitor_interface.length == 0) {                
                errors.push(error_message);
                break;
            }
        }
    } else {      
        errors.push(error_message);
    }
}

function _validateKubernetesCIDR(control: AbstractControl, errors: Array<string>){
    let kubernetes = control.get('kubernetes_services_cidr') as HtmlInput;
    if (kubernetes != null && !kubernetes.valid){
        errors.push("- Kubernetes services CIDR failed to validate. Make sure you type in a valid Kubernetes services CIDR under Global Settings.");
    }    
}

function _validateHomeNet(control: AbstractControl, errors: Array<string>){
    let sensor_resources = control.get('sensor_resources');
    
    if (sensor_resources != null){
        let home_nets = sensor_resources.get('home_nets') as FormArray;
        
        for (let i = 0; i < home_nets.length; i++){
            if (!home_nets.at(i).valid){
                errors.push("- Your home nets are not valid. You need at least one home net.");
                return;
            }
        }
    }    
}

function _validateHosts(control: AbstractControl, errors: Array<string>){
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;
    let invalid_host:string = '- Invalid hostname. Did you forget to click "Gather Facts" on one of your sensors or servers?';

    if (servers != null) {
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;
            if (!server.hostname.valid){
                errors.push(invalid_host);
                return;
            }
        }
    }

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if (!sensor.hostname.valid){
                errors.push(invalid_host);
                return;
            }
        }
    }
}

function _validateLogstashReplicas(control: AbstractControl, errors: Array<string>){
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;
    
    let number_of_servers = 0;
    let number_of_sensors = 0;

    if (servers != null) {
        number_of_servers = servers.length;        
    }

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if (sensor.sensor_type.value == sensor.sensor_type.options[0]){
                number_of_sensors += 1;
            }            
        }
    }

    if (servers != null && sensors != null){
        let logstash_replicas = parseInt(control.get('logstash_replicas').value);
        if ((number_of_sensors + number_of_servers) < 3){
            if (logstash_replicas != 1) {
                errors.push('- Logstash replicas failed to validate. This should be set to one when you have fewer than 3 nodes (discluding remote sensors).');
            }    
        } else if (logstash_replicas > (number_of_sensors + number_of_servers)) {
            errors.push('- Logstash replicas failed to validate. You cannot have more replicas than there are nodes.')
        } 
    }
}

export function ValidateKitInventory(control: AbstractControl){
    let errors = [];

    _validateMonitorInterfaces(control, errors);
    _validateCephDriveCount(control, errors);
    _validateMasterServer(control, errors);
    _validateKubernetesCIDR(control, errors);
    _validateHomeNet(control, errors);
    _validateHosts(control, errors);
    _validateLogstashReplicas(control, errors);

    if (!GetClusteredStorageValidated()){
        errors.push("- Clustered storage failed to validate. Make sure you have space for everything by checking the total system resources. Maybe you forgot to add a Ceph drive?");
    }

    // TODO elastic search math is messed up.  This needs to be fixed before we uncomment the validation checks.
    // if (!GetElasticSearchValidated()){
    //     errors.push("- Elasticsearch failed to validate. Check the server section and make sure Elasticsearch has enough RAM and CPU resources.");
    // }

    if (!GetSensorResourcesValidated()){
        errors.push("- Your sensor resources failed to validate. Check the sensor resources and make sure you have sufficient CPU resources for Bro, Suricata, etc.");
    }

    if (errors.length > 0){        
        return { errors: errors};
    }

    return null;
}