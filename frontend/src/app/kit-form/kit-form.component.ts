import { Component, OnInit } from '@angular/core';
import { KitInventoryForm, ServersFormArray, ServerFormGroup, 
         SensorFormGroup, SensorsFormArray, 
         AdvancedElasticSearchSettingsFormGroup } from './kit-form';
import { KickstartService } from '../kickstart.service';
import { HtmlModalPopUp } from '../html-elements'; 

import { ElasticSearchCalculator } from './elasticsearch-calculations';
import { StorageCalculator } from './storage-calculations';
import { MolochBroCalculator } from './moloch-bro-calculations';
import { ManualCalculator } from './manual-calculations';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';


@Component({
  selector: 'app-kit-form',
  templateUrl: './kit-form.component.html',
  styleUrls: ['./kit-form.component.css']
})
export class KitFormComponent implements OnInit {
  kitForm: KitInventoryForm;
  advancedElasticSearchForm: AdvancedElasticSearchSettingsFormGroup;
  elasicSearchCalculator: ElasticSearchCalculator;
  storageCalculator: StorageCalculator;
  molochBroCalculator: MolochBroCalculator;
  manualCalculator: ManualCalculator

  servers: ServersFormArray;
  sensors: SensorsFormArray;
  kitModal: HtmlModalPopUp;
  isAdvancedOptionsHidden: boolean;
  isMolochPercentageHidden: boolean;  

  constructor(private kickStartSrv: KickstartService, private title: Title, private router: Router) {
    this.kitForm = new KitInventoryForm();
    this.advancedElasticSearchForm = this.kitForm.advanced_elasticsearch_settings;
    this.servers = this.kitForm.servers;
    this.sensors = this.kitForm.sensors;
    this.isAdvancedOptionsHidden = true;
    this.isMolochPercentageHidden = true;
    this.kitModal = new HtmlModalPopUp('kit_modal');      
    
    this.storageCalculator = new StorageCalculator(this.kitForm);
    this.molochBroCalculator = new MolochBroCalculator(this.kitForm);
    this.elasicSearchCalculator = new ElasticSearchCalculator(this.kitForm, this.storageCalculator);
    this.manualCalculator = new ManualCalculator(this.kitForm);
  }

  ngOnInit() {
    this.title.setTitle("Kit Configuration");
    this.kickStartSrv.getKickstartForm().subscribe(data => {
      this.kitForm.root_password.setDefaultValue(data["root_password"]);

      for (let node of data["nodes"]){
        if (node["node_type"] === "Server"){          
          this.kitForm.addServerFormGroup(node["ip_address"]);
        } else if (node["node_type"] === "Sensor"){
          this.kitForm.addSensorFormGroup(node["ip_address"]);
        } else {
          console.error("Unknown Node type." + node["node_type"]);
        } 
      }
    });

    this.storageCalculator.recalculate_storage_recommendation();
    this.storageCalculator.validate_ceph_drive_count();
  }

  onSubmit(){    
    this.kickStartSrv.generateKitInventory(this.kitForm.value)
    .subscribe(data => {
      this.openConsole();
    });
  }

  openConsole(){
    this.router.navigate(['/stdout/Kit'])
  }

  toggleServer(server: ServerFormGroup) {    
    server.hidden = !server.hidden;
  }
  
  toggleSensor(sensor: SensorFormGroup) {    
    sensor.hidden = !sensor.hidden;
  }

  addServer(){
    this.kitForm.addServerFormGroup('');
  }

  removeServer(index: number){
    let server = this.kitForm.servers.at(index) as ServerFormGroup;
    this.kitForm.system_resources.subtractFromDeviceFacts(server.deviceFacts);
    this.kitForm.server_resources.subtractFromDeviceFacts(server.deviceFacts);    
    this._remove_server_cluster_storage(server.deviceFacts);
    this.kitForm.server_resources.setErrorsOrSuccesses(
      this.advancedElasticSearchForm.elastic_masters.value,
      this.advancedElasticSearchForm.elastic_datas.value,
      this.advancedElasticSearchForm.elastic_cpus.value,
      this.advancedElasticSearchForm.elastic_memory.value);
    this.elasicSearchCalculator.calculate();
    this.manualCalculator.validate_manual_entries();

    this.kitForm.servers.removeAt(index);
  }

  addSensor(){
    this.kitForm.addSensorFormGroup('');
  }

  removeSensor(index: number){
    let sensor = this.kitForm.sensors.at(index) as SensorFormGroup;
    if (sensor.deviceFacts != null){
      this.kitForm.system_resources.subtractFromDeviceFacts(sensor.deviceFacts);
      this.kitForm.sensor_resources.subtractFromDeviceFacts(sensor.deviceFacts);
      this._remove_sensor_cluster_storage(sensor.deviceFacts);
    }    
    this.kitForm.sensors.removeAt(index);
  }  

  gatherFacts(node: ServerFormGroup | SensorFormGroup) {
    this.kickStartSrv.gatherDeviceFacts(node.value["host_server"], this.kitForm.root_password.value)
    .subscribe(data => {      

      if (data['error_message']) {
        this.kitModal.updateModal('Error',
          data['error_message'],
          undefined,
          'Close');

        this.kitModal.openModal();
        //End execution of this if we have errors.
        return;
      } 

      let hasDeviceFacts: boolean = (node.deviceFacts != null);
      node.deviceFacts = data;
      if (node instanceof ServerFormGroup){
        node.setOptionSelections();
      } else if (node instanceof SensorFormGroup){
        node.setSensorOptionsSelections(node.host_server.value);
      }
      
      node.basicNodeResource.setFromDeviceFacts(node.deviceFacts);

      //Ensures we do not add additional compute power and memory by accident.
      if (!hasDeviceFacts){
        this.kitForm.system_resources.setFromDeviceFacts(node.deviceFacts);
        node.hostname.setValue(node.deviceFacts["hostname"]);

        if (node instanceof ServerFormGroup){
          this.kitForm.server_resources.setFromDeviceFacts(node.deviceFacts);
          this.kitForm.server_resources.setErrorsOrSuccesses(this.advancedElasticSearchForm.elastic_masters.value,
                                                             this.advancedElasticSearchForm.elastic_datas.value,
                                                             this.advancedElasticSearchForm.elastic_cpus.value,
                                                             this.advancedElasticSearchForm.elastic_memory.value);
          this.elasicSearchCalculator.calculate();
          this.manualCalculator.validate_manual_entries();
        } else if (node instanceof SensorFormGroup){
          this.kitForm.sensor_resources.setFromDeviceFacts(node.deviceFacts);
          this.molochBroCalculator.calculate_bro_and_moloch_threads();
        }        
      }
    });
  }

  toggleAdvancedSettings(){
    this.isAdvancedOptionsHidden = !this.isAdvancedOptionsHidden;
  }

  sensorStorageChange(dropDownValue: string){
    // Ceph
    if (dropDownValue == this.kitForm.sensor_storage_type.options[0]){
      this.kitForm.elastic_storage_percentage.setValue(30);
      this.kitForm.moloch_pcap_storage_percentage.setValue(60);
      this.isMolochPercentageHidden = false;
      
      if (this.kitForm.disable_autocalculate.value){
        this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.enable();
      }

      //TODO we need to recalculate the moloch pcap pv size here.
    } else {
      // PCAP
      this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.disable();
      this.kitForm.elastic_storage_percentage.setValue(90);
      this.kitForm.moloch_pcap_storage_percentage.setValue(this.kitForm.moloch_pcap_storage_percentage.default_value);
      this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.setValue(0);
      this.isMolochPercentageHidden = true;
      
      for (let i = 0; i < this.kitForm.sensors.length; i++){
        let sensor = this.kitForm.sensors.at(i) as SensorFormGroup;
        this._remove_sensor_cluster_storage(sensor.deviceFacts);
      }
    }

    this.elasicSearchCalculator.calculate();
    this.manualCalculator.validate_manual_entries();
    this.molochBroCalculator.calculate_bro_and_moloch_threads();
    
    this.setSystemClusterStorageAvailable();
    this.storageCalculator.recalculate_storage_recommendation();
  }

  cephDriveSelected(drivesSelected: Array<string>, node: SensorFormGroup | ServerFormGroup){
    this.kitForm.system_resources.calculateTotalCephDrives(drivesSelected.length, node.deviceFacts);

    if (node instanceof SensorFormGroup){
      this.kitForm.sensor_resources.calculateClusterStorageAvailable(drivesSelected, node.deviceFacts);
    } else if (node instanceof ServerFormGroup){
      this.kitForm.server_resources.calculateClusterStorageAvailable(drivesSelected, node.deviceFacts);
    }
    
    this.setSystemClusterStorageAvailable();
    this.storageCalculator.recalculate_storage_recommendation();
    this.storageCalculator.validate_ceph_drive_count();
  }

  private setSystemClusterStorageAvailable(){
    this.kitForm.system_resources.clusterStorageAvailable = 0;
    this.kitForm.system_resources.clusterStorageAvailable += this.kitForm.sensor_resources.clusterStorageAvailable;
    this.kitForm.system_resources.clusterStorageAvailable += this.kitForm.server_resources.clusterStorageAvailable;
  }

  /**
   * Disables other "Is Kubernetes master server" checkboxes on the UI.
   * 
   * @param isChecked - Is true if the checkbox has a check mark in it, false otherwise.
   * @param indexToIgnore - The server index to ignore
   */
  disableOtherMasterOrReenable(isChecked: boolean, indexToIgnore: number){    
    for (let index = 0; index < this.kitForm.servers.length; index++){
      if (index == indexToIgnore){
        continue;
      }
      let server = this.kitForm.servers.at(index) as ServerFormGroup;
      if (isChecked){
        server.is_master_server.disable();
      } else{
        server.is_master_server.enable();
      }
    }
  }

  /**
   * When user clicks Disable Autocalculations under Advanced Settings,
   * this is triggered.
   * 
   * @param isChecked Is true if the checkbox has a check mark in it, false otherwise.
   */
  toggleAutocalculate(isChecked: boolean){

    if (isChecked){
      //CEPH for PCAP option
      if (this.kitForm.sensor_storage_type.value == this.kitForm.sensor_storage_type.options[0] ){
        this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.enable();
      }

      this.kitForm.elastic_cpu_percentage.disable();
      this.kitForm.elastic_memory_percentage.disable();
      this.kitForm.elastic_storage_percentage.disable();

      this.kitForm.advanced_elasticsearch_settings.elastic_masters.enable();
      this.kitForm.advanced_elasticsearch_settings.elastic_datas.enable();
      this.kitForm.advanced_elasticsearch_settings.elastic_cpus.enable();
      this.kitForm.advanced_elasticsearch_settings.elastic_memory.enable();
      this.kitForm.advanced_elasticsearch_settings.elastic_pv_size.enable();

      this.kitForm.advanced_elasticsearch_settings.elastic_cpus_per_instance_ideal.disable();
      this.kitForm.advanced_elasticsearch_settings.elastic_cpus_to_mem_ratio.disable();

      for (let i = 0; i < this.kitForm.sensors.length; i++){
        let sensor = this.kitForm.sensors.at(i) as SensorFormGroup;
        sensor.bro_workers.enable();
        sensor.moloch_threads.enable();
      }
    } else {
      this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.disable();
      this.kitForm.elastic_cpu_percentage.enable();
      this.kitForm.elastic_memory_percentage.enable();
      this.kitForm.elastic_storage_percentage.enable();

      this.kitForm.advanced_elasticsearch_settings.elastic_masters.disable();
      this.kitForm.advanced_elasticsearch_settings.elastic_datas.disable();
      this.kitForm.advanced_elasticsearch_settings.elastic_cpus.disable();
      this.kitForm.advanced_elasticsearch_settings.elastic_memory.disable();
      this.kitForm.advanced_elasticsearch_settings.elastic_pv_size.disable();

      this.kitForm.advanced_elasticsearch_settings.elastic_cpus_per_instance_ideal.enable();
      this.kitForm.advanced_elasticsearch_settings.elastic_cpus_to_mem_ratio.enable();

      for (let i = 0; i < this.kitForm.sensors.length; i++){
        let sensor = this.kitForm.sensors.at(i) as SensorFormGroup;
        sensor.bro_workers.disable();
        sensor.moloch_threads.disable();
      }
    }
  }

  /**
   * Triggered everytime a user adds input to the Kubernetes CIDR input
   * 
   * @param event - A Keyboard event.
   */
  kubernetesInputEvent(event: any) {
    let kubernetes_value = this.kitForm.kubernetes_services_cidr.value;
    if (kubernetes_value == undefined) {
      return;
    }

    let octet_1 = kubernetes_value.split('.')[0] + '.';
    let octet_2 = kubernetes_value.split('.')[1] + '.';
    let octet_3 = kubernetes_value.split('.')[2] + '.';
    let octet_4 = parseInt(kubernetes_value.split('.')[3]);
    let kubernetes_services_cidr_start = "";
    
    if (isNaN(octet_4)) {
      this.kitForm.kubernetesCidrInfoText = "Incomplete IP Address";
    } else {
      while (octet_4 > 0) {
        // The magic number 16 correlates to a /28. We're basically looking for
        // the first subnet which matches a /28 and that will end up being the
        // base address for the range. If the number is evenly divisible by 16
        // that means we've found the base of the address range and 15 beyond that
        // is the maximum range.
        if (octet_4 % 16 == 0) {
          break;
        } else {
          octet_4 -= 1;
        }
      }
      // You can't have an address of 0 so Metallb will actually increment this by
      // 1 in this case.
      if (octet_4 == 0) {
        octet_4 = 1;
        kubernetes_services_cidr_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        this.kitForm.kubernetesCidrInfoText = "Kubernetes services range will be: " + kubernetes_services_cidr_start + "-" + String(octet_4 + 14);
      } else {
        kubernetes_services_cidr_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        this.kitForm.kubernetesCidrInfoText = "Kubernetes services range will be: " + kubernetes_services_cidr_start + "-" + String(octet_4 + 15);
      }
    }

  }

  /**
   * Triggered every time a user selects a different sensor type.
   * 
   * @param dropDownValue - The new dropdown value (IE: Local or Remote)
   * @param index - The index of the sensor in question.
   */
  sensorTypeChange(dropDownValue: string, index: number){
    let sensor = this.kitForm.sensors.at(index) as SensorFormGroup;
    this._remove_sensor_cluster_storage(sensor.deviceFacts);
  }

  triggerValidations(event: any){
    this.manualCalculator.validate_manual_entries();
    this.elasicSearchCalculator.calculate();
  }

  private _remove_server_cluster_storage(deviceFacts: Object){
    if (deviceFacts != null){
      this.kitForm.system_resources.calculateTotalCephDrives(0, deviceFacts);                
      this.kitForm.server_resources.removeClusterStorage(deviceFacts);      
      this.setSystemClusterStorageAvailable();
      this.storageCalculator.recalculate_storage_recommendation();
      this.storageCalculator.validate_ceph_drive_count();
    }
  }

  private _remove_sensor_cluster_storage(deviceFacts: Object){
    if (deviceFacts != null){
      this.kitForm.system_resources.calculateTotalCephDrives(0, deviceFacts);                
      this.kitForm.sensor_resources.removeClusterStorage(deviceFacts);      
      this.setSystemClusterStorageAvailable();
      this.storageCalculator.recalculate_storage_recommendation();
      this.storageCalculator.validate_ceph_drive_count();
    }
  }
}
