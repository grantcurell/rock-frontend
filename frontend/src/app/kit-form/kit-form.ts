import {
    FormGroup, FormArray,
    AbstractControl,
    ValidationErrors
} from '@angular/forms';

import { HtmlInput, HtmlCheckBox, HtmlDropDown, HtmlCardSelector, HtmlHidden, HtmlDatePicker } from '../html-elements';
import { SensorResourcesForm } from '../total-sensor-resources-card/total-sensor-resources-form';
import { TotalServerResources } from '../total-server-resources-card/total-server-resources-form';
import {  PERCENT_PLACEHOLDER, PERCENT_MIN_MAX, PERCENT_INVALID_FEEDBACK,
          PERCENT_VALID_FEEDBACK, KUBE_CIDR_CONSTRAINT, IP_CONSTRAINT, HOST_CONSTRAINT,
          CONSTRAINT_MIN_ONE, MIN_ONE_INVALID_FEEDBACK,
          INVALID_FEEDBACK_INTERFACE, INVALID_FEEDBACK_IP,
          TIMEZONES
       } from '../frontend-constants';

import { BasicNodeResource, BasicNodeResourceInterface } from '../basic-node-resource-card/basic-node-resource-card.component';
import { TotalSystemResources } from '../total-system-resource-card/total-system-resource-form';
import { ValidateKitInventory } from './kit-form-validation';
import { AdvancedMolochSettingsFormGroup, 
        AdvancedElasticSearchSettingsFormGroup,
        AdvancedKafkaSettingsFormGroup} from './kit-advanced-form';


export interface DeviceFactsContainerInterface{
    deviceFacts: Object;
}

/**
 * Sets the drive selections based on the passed in deviceFacts.
 *
 * @param deviceFacts
 * @returns - [{value: "sdb", label: "sdb - 50 GB"}]
 */
function SetDriveSelections(deviceFacts: Object) : Array<{value: string, label: string}> {
    let driveSelections = new Array();

    if (deviceFacts == null){
        return driveSelections;
    }

    for (let item of deviceFacts["disks"]){
        if (item["hasRoot"]){
            continue;
        }
        driveSelections.push({value: item["name"], label: item["name"] + " - " + item["size_gb"].toFixed(2) + " GB"})
     }
    return driveSelections;
}

export class SensorFormGroup extends FormGroup implements BasicNodeResourceInterface, DeviceFactsContainerInterface {
    public hidden: boolean;
    public basicNodeResource: BasicNodeResource;
    public deviceFacts: Object;
    public interfaceSelections: Array<{value: string, label: string}>;
    public driveSelections: Array<{value: string, label: string}>;

    constructor(hidden: boolean, managementIP: string, sensor_type: string) {
        super({});
        this.hidden = hidden;
        this.host_sensor.setDefaultValue(managementIP);
        super.addControl('host_sensor', this.host_sensor);
        super.addControl('monitor_interface', this.monitor_interface);
        super.addControl('ceph_drives', this.ceph_drives);
        super.addControl('pcap_drives', this.pcap_drives);
        super.addControl('hostname', this.hostname);
        super.addControl('bro_workers', this.bro_workers);
        super.addControl('moloch_threads', this.moloch_threads);

        //this.sensor_type.
        this.sensor_type.setValue(sensor_type);
        super.addControl('sensor_type', this.sensor_type);
        this.basicNodeResource = new BasicNodeResource();
        this.deviceFacts = null;
        this.interfaceSelections = new Array();
        this.driveSelections = new Array();
    }

    clearSelectors(){
        while (this.pcap_drives.length !== 0) {
            this.pcap_drives.removeAt(0);
        }

        while (this.ceph_drives.length !== 0) {
            this.ceph_drives.removeAt(0);
        }

        while (this.monitor_interface.length !== 0) {
            this.monitor_interface.removeAt(0);
        }
    }

    getRawValue(): any {
        let rawValue = super.getRawValue();
        rawValue['deviceFacts'] = this.deviceFacts;
        return rawValue;
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.monitor_interface.disable();
        this.ceph_drives.disable();
        this.pcap_drives.disable();
        this.bro_workers.disable();
        this.moloch_threads.disable();
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
      }): void{
        super.enable(opts);
        this.host_sensor.disable();
        this.sensor_type.disable();
    }

    /**
     * When calling this make sure you call set_drive_selections
     * after you have set deviceFacts.
     *
     * @param mObj
     */
    public from_object(mObj: Object){
        this.deviceFacts = mObj['deviceFacts'];
        this.bro_workers.setValue(mObj['bro_workers']);
        this.host_sensor.setValue(mObj['host_sensor']);
        this.hostname.setValue(mObj['hostname']);
        this.moloch_threads.setValue(mObj['moloch_threads']);
        this.sensor_type.setValue(mObj['sensor_type']);
        this.monitor_interface.default_selections = mObj['monitor_interface'];
        this.ceph_drives.default_selections = mObj['ceph_drives'];
        this.pcap_drives.default_selections = mObj['pcap_drives'];
    }

    hostname = new HtmlHidden('hostname', true);

    /**
     * Sets option selections for both interfaces and CEPH drives.
     */
    public setSensorOptionsSelections(managementIp: string){
        if (this.deviceFacts == null){
            return;
        }

        //Reset selections if user clicks on Gather facts twice.
        this.interfaceSelections = new Array();
        this.driveSelections = new Array();
        this.driveSelections = SetDriveSelections(this.deviceFacts);

        for (let item of this.deviceFacts["interfaces"]){
            if (item["name"] == 'lo'){
                continue;
            }

            if (item["ip_address"] == managementIp){
                continue;
            }

            this.interfaceSelections.push({value: item["name"], label: item["name"]})
        }
    }

    host_sensor = new HtmlInput (
        'host_sensor',
        'Management IP Address',
        "Server's management IP address",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        undefined,
        '',
        undefined,
        true
    )

    monitor_interface = new HtmlCardSelector(
        'monitor_interface',
        'Select Monitor Interface',
        "The interfaces on the sensor you would like to use for monitoring.\
        These will be the interfaces that Moloch, Bro, and Suricata use.\
        Note: The management interface will not appear in this list. You \
        cannot use an interface for both management and monitoring.",
        "Select which interfaces you would like to use as monitor interfaces.",
        "Note: The management interface will not be listed below. It is not eligble for use as a monitor interface.",
        INVALID_FEEDBACK_INTERFACE,
        true,
    )

    ceph_drives = new HtmlCardSelector (
        'ceph_drives',
        "Ceph Drives",
        "Use this field to mark the disks you will use for Ceph. You can choose to select \
        none. In this case, Ceph will still be installed and active on the machine so that \
        Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
        This is common on the sensors. You may choose to use direct attached storage for \
        your PCAP on one drive and then use the other for your OS. In which case, Moloch \
        can still write over the network to a clustered drive on another machine for its \
        metadata which is light weight especially compared to PCAP. You can select multiple \
        drives if you would like. Make sure you don't select the OS' drive as Ceph will \
        format and overwrite any drives you select.",
        "Select which drives on the host, if any, that you would like to add to the Ceph cluster.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        true
    )

    pcap_drives = new HtmlCardSelector (
        'pcap_drives',
        "PCAP Drives",
        "TODO Add a PCAP description here.",
        "Select which drive you would like to use for PCAP storage.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        false
    )

    bro_workers = new HtmlInput(
        'bro_workers',
        'Number of Bro Workers',
        "1",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '0',
        "The number of bro workers to run on each sensor. The worker is the Bro process \
        that sniffs network traffic and does protocol analysis on the reassembled traffic \
        streams. Most of the work of an active cluster takes place on the workers and \
        as such, the workers typically represent the bulk of the Bro processes that \
        are running in a cluster. See https://www.bro.org/sphinx/cluster/index.html for \
        more information.",
        undefined,
        true
    )

    moloch_threads = new HtmlInput (
        'moloch_threads',
        'Number of Moloch Threads',
        "1",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '0',
        "Number of threads to use to process packets AFTER the reader has received \
        the packets. This also controls how many packet queues there are, since each \
        thread has its own queue. Basically how much CPU to dedicate to parsing the \
        packets. Increase this if you get errors about dropping packets or the packetQ \
        is over flowing.",
        undefined,
        true
    )

    sensor_type = new HtmlInput(
        'sensor_storage_type',
        'Sensor Type',
        '',
        'text',
        null,
        '',
        true,
        'test',
        "Indicates if the sensor in question is a local or a remote sensor.",
        undefined,
        true        
    )
}

export class ServerFormGroup extends FormGroup implements BasicNodeResourceInterface, DeviceFactsContainerInterface {
    public hidden: boolean;
    public basicNodeResource: BasicNodeResource;
    public deviceFacts: Object;
    public driveSelections: Array<{value: string, label: string}>;

    constructor(hidden: boolean, managementIP: string, disableIsKubernetesMasterCheckbox: boolean=false) {
        super({});
        this.hidden = hidden;
        this.host_server.setDefaultValue(managementIP);
        super.addControl('host_server', this.host_server);
        super.addControl('is_master_server', this.is_master_server);
        super.addControl('ceph_drives', this.ceph_drives)
        super.addControl('hostname', this.hostname);
        if (disableIsKubernetesMasterCheckbox){
            this.is_master_server.disable();
        }
        this.basicNodeResource = new BasicNodeResource();
        this.driveSelections = new Array();
        this.deviceFacts = null;
    }

    clearSelectors(){
        while (this.ceph_drives.length !== 0) {
            this.ceph_drives.removeAt(0);
        }
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.is_master_server.disable();
        this.ceph_drives.disable();
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
      }): void{
        super.enable(opts);
        this.host_server.disable();
    }

    getRawValue(): any {
        let rawValue = super.getRawValue();
        rawValue['deviceFacts'] = this.deviceFacts;
        return rawValue;
    }

    /**
     * After you call this make sure you set drive selections
     * after you have set deviceFacts.
     *
     * @param mObj
     */
    public from_object(mObj: Object){
        this.deviceFacts = mObj['deviceFacts'];
        this.host_server.setValue(mObj['host_server']);
        this.hostname.setValue(mObj['hostname']);
        this.is_master_server.checked = mObj['is_master_server'];
        this.is_master_server.setValue(mObj['is_master_server']);
        this.ceph_drives.default_selections = mObj['ceph_drives'];
    }

    public setOptionSelections(){
        this.driveSelections = SetDriveSelections(this.deviceFacts);
    }

    hostname = new HtmlHidden('hostname', true);

    host_server = new HtmlInput (
        'host_server',
        'Management IP Address',
        "Server's management IP address",
        'text',
        IP_CONSTRAINT,
        'You must input the server management IP address.',
        true,
        undefined,
        '',
        undefined,
        true        
    )

    is_master_server = new HtmlCheckBox(
        "is_master_server",
        "Is Kubernetes master server?",
        "This is not the ESXi/VM server. This is for the Kubernetes master server only.\
        There can only be one master server. It is a bit like the Highlander that way.\
        The master server is special in that it runs the Kubernetes master and is     \
        responsible for deploying services out to all the other hosts in the cluster. \
        This server should be fairly beefy. By default, this server will also provide \
        DNS to the rest of the kit for internal services. WARNING: If this server     \
        fails, the entire kit goes down with it!!!"
    )

    //TODO make this spot dry
    ceph_drives = new HtmlCardSelector (
        'ceph_drives',
        "Ceph Drives",
        "Use this field to mark the disks you will use for Ceph. You can choose to select \
        none. In this case, Ceph will still be installed and active on the machine so that \
        Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
        This is common on the sensors. You may choose to use direct attached storage for \
        your PCAP on one drive and then use the other for your OS. In which case, Moloch \
        can still write over the network to a clustered drive on another machine for its \
        metadata which is light weight especially compared to PCAP. You can select multiple \
        drives if you would like. Make sure you don't select the OS' drive as Ceph will \
        format and overwrite any drives you select.",
        "Select which drives on the host, if any, that you would like to add to the Ceph cluster.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        true
    )
}

export class SensorsFormArray extends FormArray {
    constructor(controls: AbstractControl[],
                public hidden: boolean) {
        super(controls);
    }
}

export class ServersFormArray extends FormArray {
    constructor(controls: AbstractControl[],
                public hidden: boolean) {
        super(controls);
    }
}

function validateIPOrHost(control: AbstractControl): ValidationErrors | null {
    let ctrl = control as HtmlInput;    
    let patterns: Array<string> = [IP_CONSTRAINT, HOST_CONSTRAINT];
    let isValid = false;

    if (!ctrl.required && control.value === ""){
        return null;
    }

    for (let pattern of patterns){
        let pat = new RegExp(pattern);
        let result = pat.test(control.value);

        if (!isValid){
            isValid = result;
        }
    }

    if (!isValid){
        
        return {"custom_error": ctrl.invalid_feedback};
    } 

    return null;
  }

export class KitInventoryForm extends FormGroup {
    servers: ServersFormArray;
    sensors: ServersFormArray;
    endgame_warning: string;
    kubernetesCidrInfoText;

    constructor() {
        super({}, ValidateKitInventory);
        super.addControl('sensor_storage_type', this.sensor_storage_type);
        super.addControl('elastic_cpu_percentage', this.elastic_cpu_percentage);
        super.addControl('elastic_memory_percentage', this.elastic_memory_percentage);
        super.addControl('logstash_cpu_percentage', this.logstash_cpu_percentage);
        super.addControl('logstash_replicas', this.logstash_replicas);
        super.addControl('elastic_storage_percentage', this.elastic_storage_percentage);
        super.addControl('moloch_pcap_storage_percentage', this.moloch_pcap_storage_percentage);
        super.addControl('kubernetes_services_cidr', this.kubernetes_services_cidr);

        this.servers = new ServersFormArray([], true);
        this.sensors = new SensorsFormArray([], true);
        this.endgame_warning = '';
        super.addControl('servers', this.servers);
        super.addControl('sensors', this.sensors);
        super.addControl('sensor_resources', this.sensor_resources);
        super.addControl('server_resources', this.server_resources);

        super.addControl('advanced_moloch_settings', this.advanced_moloch_settings);
        super.addControl('advanced_elasticsearch_settings', this.advanced_elasticsearch_settings);
        super.addControl('advanced_kafka_settings', this.advanced_kafka_settings);
        super.addControl('dns_ip', this.dns_ip);
        super.addControl('disable_autocalculate', this.disable_autocalculate);
        super.addControl('ceph_redundancy', this.ceph_redundancy);
        super.addControl('endgame_iporhost', this.endgame_iporhost);
        super.addControl('endgame_username', this.endgame_username);
        super.addControl('endgame_password', this.endgame_password);
        super.addControl('install_grr', this.install_grr);
        this.kubernetesCidrInfoText = "";
    }

   /**
    * Overridden method
    */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.reset({'elastic_cpu_percentage': this.elastic_cpu_percentage.default_value,
                     'elastic_memory_percentage': this.elastic_memory_percentage.default_value,
                     'logstash_cpu_percentage': this.logstash_cpu_percentage.default_value,
                     'elastic_storage_percentage': this.elastic_storage_percentage.default_value,
                     'sensor_storage_type': this.sensor_storage_type.default_value,
                     'logstash_replicas': this.logstash_replicas.default_value,
                     'moloch_pcap_storage_percentage': this.moloch_pcap_storage_percentage.default_value
                    });
        this.clearNodes();
        this.system_resources.reinitalize();
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.enable(opts);        
    }

    /**
     * Overridden method
     *
     * @param opts
     */
    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.sensor_storage_type.disable();
        this.elastic_cpu_percentage.disable();
        this.elastic_memory_percentage.disable();
        this.logstash_cpu_percentage.disable();
        this.logstash_replicas.disable();
        this.elastic_storage_percentage.disable();
        this.moloch_pcap_storage_percentage.disable();
        this.kubernetes_services_cidr.disable();

        this.servers.disable();
        this.sensors.disable();
        this.sensor_resources.disable();
        this.server_resources.disable();

        this.advanced_moloch_settings.disable();
        this.advanced_elasticsearch_settings.disable();
        this.advanced_kafka_settings.disable();
        this.dns_ip.disable();
        this.disable_autocalculate.disable();
        this.ceph_redundancy.disable();
        this.endgame_iporhost.disable();
        this.endgame_username.disable();
        this.endgame_password.disable();
        this.install_grr.disable();
    }

    public clearNodes() {
        while (this.servers.length !== 0) {
            this.servers.removeAt(0);
        }
        while (this.sensors.length !== 0) {
            this.sensors.removeAt(0);
        }
    }

    public addServerFormGroup(managementIP: string, disableIsKubernetesMasterCheckbox: boolean=false){
        this.servers.hidden = false;
        this.servers.push(new ServerFormGroup(false, managementIP, disableIsKubernetesMasterCheckbox));
    }

    public addSensorFormGroup(managementIP: string, sensorType: string) {
        this.sensors.hidden = false;
        this.sensors.push(new SensorFormGroup(false, managementIP, sensorType));
    }

    system_resources = new TotalSystemResources();
    server_resources = new TotalServerResources();
    sensor_resources = new SensorResourcesForm();

    advanced_moloch_settings = new AdvancedMolochSettingsFormGroup();
    advanced_elasticsearch_settings = new AdvancedElasticSearchSettingsFormGroup();
    advanced_kafka_settings = new AdvancedKafkaSettingsFormGroup();

    sensor_storage_type = new HtmlDropDown(
        'sensor_storage_type',
        'Sensor Storage Type',
        ['Use Ceph clustered storage for PCAP', 'Use hard drive for PCAP storage'],
        "The kit can use two types of storage for PCAP. One is clustered Ceph storage \
        and the other is a disk on the sensor itself. See what_is_ceph['label'] \
        for a description of Ceph. The advantage to clustered storage \
        is that all hard drives given to Ceph are treated like one \"mega hard drive\". \
        This means that you may have PCAP come in on sensor 1, but if its disk is filling \
        up, it can just write that data to the disk on sensor 2 because it is also part \
        of the Ceph cluster. The downside is that now all of the internal kit traffic \
        must traverse the internal kit network backbone. If you have a 10Gb/s link, this \
        may not be a big deal to you. If you only have a 1Gb/s link, this will likely be \
        a bottleneck. However, if you aren't capturing a lot of traffic, this may not \
        be a big deal to you. In direct attached storage mode, you will write the data \
        directly to a locally attached disk or folder on the sensor. This obviously is \
        much faster, but has the downside in that once that disk is full, the data has \
        to roll even if there is space available elsewhere in the kit. Regardless of your \
        decision, this only applies to PCAP. Everything else will use clustered storage \
        with Ceph. Though, that traffic is only a fraction of what PCAP consumes in most \
        cases.",
        'Use hard drive for PCAP storage'
    )    

    endgame_iporhost = new HtmlInput(
        'endgame_iporhost',
        'Endgame IP or Hostname',
        'Optional field.  This is only required if you want to setup Endgame integration with your Kit configuration.',
        'text',
        validateIPOrHost,
        'You must enter a valid hostname or IP address for the Endgame server.',
        false,
        '',
        "Setting this enables a script which will pull Endgame data into Elasticsearch for easier pivoting/maneuver on Endgame data."
    )

    endgame_username = new HtmlInput(
        'endgame_username',
        'Endgame Username',
        'Optional field.  This is only required if you want to setup Endgame integration with your Kit configuration.',
        'text',
        null,
        '',
        false,
        '',
        "The username needed for Endgame integration."
    )

    endgame_password = new HtmlInput(
        'endgame_password',
        'Endgame Password',
        'Optional field.  This is only required if you want to setup Endgame integration with your Kit configuration.',
        'text',
        null,
        '',
        false,
        '',
        "The password needed for Endgame integration."
    )

    elastic_cpu_percentage = new HtmlInput(
        'elastic_cpu_percentage',
        'Elasticsearch CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        "90",
        "This is the percentage of server CPUs which the system will dedicated to \
        Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- CPUs here does not mean dedicated CPUs. \
        This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
        What this means is that Elasticsearch pods will have a request of \
        X value for the server's compute power. If Elasticsearch is using less than this, \
        other devices can use those resources. However, when under load, Elasticsearch is \
        guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
        Basically, you can think of this as a simple percentage of how much of the server\'s \
        CPU you want going to Elasticsearch.",
        PERCENT_VALID_FEEDBACK
    )

    elastic_memory_percentage = new HtmlInput(
        'elastic_memory_percentage',
        'Elasticsearch RAM %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        "90",
        "This is the percentage of server RAM which the system will dedicated to \
        Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- \
        This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
        What this means is that Elasticsearch pods will have a request of \
        X value for the server's compute power. If Elasticsearch is using less than this, \
        other devices can use those resources. However, when under load, Elasticsearch is \
        guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
        Basically, you can think of this as a simple percentage of how much of the server\'s \
        RAM you want going to Elasticsearch.",
        PERCENT_VALID_FEEDBACK
    )

    logstash_cpu_percentage = new HtmlInput(
        'logstash_cpu_percentage',
        'Logstash Servers CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '5',
        "The Percentage of the server CPU resources which will be dedicated to logstash. \
        Unlike some of the other calculations, this is a percentage of the total server \
        resources.",
        PERCENT_VALID_FEEDBACK
    )

    logstash_replicas = new HtmlInput (
        'logstash_replicas',
        'Logstash Replicas',
        "The number of logstash instances you would like to run",
        'number',
        '^[1-9]|[1-9]\\d+$',
        'Enter the number of elasticsearch master instances you would like',
        true,
        '1',
        "This is the number of instances of Logstash you would like to run."
    )

    elastic_storage_percentage = new HtmlInput (
        'elastic_storage_percentage',
        'ES Storage Space %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '90',
        "Setting this value correctly can be a bit confusing. It depends primarily if you \
        are running Ceph for PCAP storage or not. If you are not using Ceph for PCAP storage \
        then this value can be very high - we recommend around 90%. This is due to the \
        fact that Elasticsearch accounts for the overwhelming bulk of the resource demand \
        on the server and there's not much need for storing other things. However, if you \
        are using Ceph for PCAP then you will have to share server storage with Moloch. \
        Moloch also takes up a lot of space. If you are running Moloch, in general, we give \
        Moloch 60% and Elasticsearch 30%, but this depends heavily on the size of your disk storage.",
        PERCENT_VALID_FEEDBACK
    )

    moloch_pcap_storage_percentage = new HtmlInput (
        'moloch_pcap_storage_percentage',
        'Moloch PCAP Storage Percentage',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '1',
        "This is the percentage of the clustered storage which will be assigned to Moloch PCAP. \
        In general, we give this 60% and Elasticsearch 30%, but this depends heavily on \
        the amount of storage you have available. You can play with the values to see what \
        works for you.",
        PERCENT_VALID_FEEDBACK
    )

    kubernetes_services_cidr = new HtmlDropDown(
        'kubernetes_services_cidr',
        'Kubernetes Service IP Range Start',
        [],
        "Services_cidr is the range of addresses kubernetes will use for external services \
        This includes cockpit (a front end for Kubernetes), Moloch viewer, Kibana, elastichq, kafka-manager, and the \
        kubernetes dashboard. This will use a /28 under the hood. This means it will take \
        whatever IP address you enter and create a range addresses from that IP +16. For example, \
        192.168.1.16 would become a range from 192.168.1.16-31."        
    )

    dns_ip = new HtmlInput(
        'dns_ip',
        'DNS IP Address',
        "Same as Master Server management IP",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        false,
        undefined,
        "The IP address of the system DNS server. You may define this or it will   \
        default  to using the master server's management IP. We suggest you leave \
        it to default  unless you have a specific reason to use a different DNS   \
        server. Keep in mind  you will need to manually provide all required DNS  \
        entries on your separate  DNS Server or the kit will break."
    )

    disable_autocalculate = new HtmlCheckBox(
        "disable_autocalculate",
        "Disable Autocalculations for Elasticsearch/Logstash/Moloch Threads/Bro Workers",
        "By default, the system will calculate recommended values for the number of Elasticsearch \
        nodes required, Elasticsearch resource requirements, Logstash, Bro workers, and Moloch threads. \
        If you know what you are doing and you have a specific use case, you may not want these \
        values autocalculated for you. In general, you should use the field " +
        this.elastic_cpu_percentage.label + " and " + this.elastic_memory_percentage.label + " \
        to control the allocation of resources for Elasticsearch. The algorithm was based \
        on recommendations from Elasticsearch. However, you may disable these by unchecking \
        this checkbox."
    )

    ceph_redundancy = new HtmlCheckBox(
        "ceph_redundancy",
        "Ceph Redundancy",
        "You can set how many OSD are allowed to fail without losing data. For replicated pools, it is the \
        desired number of copies/replicas of an object. Our configuration stores an object and one \
        additional copy, The check box will enable this."
    )

    install_grr = new HtmlCheckBox(
        "install_grr",
        "Install Google Rapid Response",
        "WARNING: Installing Google Rapid Response is an alpha feature.  \
        Google Rapid Response is an open sourced, agent based, endpoint protection platform.  \
        You can use to to hunt for threats on host systems."
    )
}


export class ExecuteKitForm extends FormGroup {    

    constructor() {
        super({});
        super.addControl('date', this.date);
        super.addControl('time', this.time);
        super.addControl('timezone', this.timezone);
    }
  
    date = new HtmlDatePicker(
        'date',
        'Current Date',
        true,
        'This is the date used for your cluster.  Make sure it is correct before executing your kit configuration.',
    )

    time = new HtmlInput(
        'time',
        'Current Time',
        'HH:MM in military time',
        'text',
        '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$',
        'Invalid. The proper format should be HH:MM in military time.',
        true,
        '',
        'This is the time used for your cluster.  Make sure it is correct before executing your kit configuration.'
    )

    timezone = new HtmlDropDown(
        'timezone',
        'Timezone',
        TIMEZONES,
        "This option is sets each node's timezone during the kickstart provisioning process (Automated Operating System installation).",
        'UTC'
    )
}
