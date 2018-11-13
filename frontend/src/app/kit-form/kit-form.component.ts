import { Component, OnInit } from '@angular/core';
import { KitInventoryForm, ServersFormArray, ServerFormGroup,
         SensorFormGroup, SensorsFormArray,
         AdvancedElasticSearchSettingsFormGroup,
         ExecuteKitForm } from './kit-form';
import { KickstartService } from '../kickstart.service';
import { KitService } from '../kit.service';
import { HtmlModalPopUp, HtmlDropDown, HtmlModalSelectDialog, ModalType } from '../html-elements'; 
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { ElasticSearchCalculator } from './elasticsearch-calculations';
import { StorageCalculator } from './storage-calculations';
import { MolochBroCalculator } from './moloch-bro-calculations';
import { ManualCalculator } from './manual-calculations';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HomeNetFormGroup, ExternalNetFormGroup } from '../total-sensor-resources-card/total-sensor-resources-form';


@Component({
  selector: 'app-kit-form',
  templateUrl: './kit-form.component.html',
  styleUrls: ['./kit-form.component.css']
})
export class KitFormComponent implements OnInit {
  kitForm: KitInventoryForm;
  executeKitForm: ExecuteKitForm;
  advancedElasticSearchForm: AdvancedElasticSearchSettingsFormGroup;
  elasicSearchCalculator: ElasticSearchCalculator;
  storageCalculator: StorageCalculator;
  molochBroCalculator: MolochBroCalculator;
  manualCalculator: ManualCalculator
  hasKitForm: boolean;

  servers: ServersFormArray;
  sensors: SensorsFormArray;
  kitModal: HtmlModalPopUp;
  executeKitModal: HtmlModalPopUp;
  archiveKitModal: HtmlModalPopUp;
  restoreModal: HtmlModalSelectDialog;
  isAdvancedOptionsHidden: boolean;
  isMolochPercentageHidden: boolean;

  //This boolean tracks if we are executing add node instead of execute kit.
  isAddNodeInsteadOfNewKit: boolean;

  //The addNodeCache
  addNodeCache: Array<Object>;

  constructor(private kickStartSrv: KickstartService, 
              private title: Title, 
              private router: Router, 
              private kitSrv: KitService) 
  {
    this.kitForm = new KitInventoryForm();
    this.executeKitForm = new ExecuteKitForm();
    this.advancedElasticSearchForm = this.kitForm.advanced_elasticsearch_settings;
    this.servers = this.kitForm.servers;
    this.sensors = this.kitForm.sensors;
    this.isAdvancedOptionsHidden = true;
    this.isMolochPercentageHidden = true;
    this.kitModal = new HtmlModalPopUp('kit_modal');
    this.executeKitModal = new HtmlModalPopUp('execute_kit_modal');
    this.archiveKitModal = new HtmlModalPopUp('archive_modal');
    this.restoreModal = new HtmlModalSelectDialog("restore_modal");

    this.storageCalculator = new StorageCalculator(this.kitForm);
    this.molochBroCalculator = new MolochBroCalculator(this.kitForm);
    this.elasicSearchCalculator = new ElasticSearchCalculator(this.kitForm, this.storageCalculator);
    this.manualCalculator = new ManualCalculator(this.kitForm);
    this.hasKitForm = false;
    this.isAddNodeInsteadOfNewKit = false;
    this.addNodeCache = new Array();
  }

  /**
   * Maps our saved form object to view.
   *
   * @param data - The data to map
   * @param formGroup - The form group we are mapping our data too.
   */
  private _map_to_form(data: Object, formGroup: FormGroup, rootPassword: string){
    for (let key in data){
      let someFormObject = formGroup.get(key);      

      if (someFormObject instanceof HtmlDropDown){
        setTimeout(()=> {
          someFormObject.setValue(data[key]);
        });
      } else if (someFormObject instanceof FormControl){
        someFormObject.setValue(data[key]);
      } else if (someFormObject instanceof FormGroup){
        this._map_to_form(data[key], someFormObject, rootPassword);

      } else if (someFormObject instanceof SensorsFormArray 
                 || someFormObject instanceof ServersFormArray) {
        var nodeFormArray: FormArray = someFormObject as FormArray;

        for (let index = 0; index < data[key].length; index++) {          
          let srvFormGroup: SensorFormGroup | ServerFormGroup = new SensorFormGroup(false, null, null);
          let host_key: string = "host_sensor";
          if (someFormObject instanceof ServersFormArray){
            srvFormGroup = new ServerFormGroup(false, null);
            host_key = "host_server";
          }
          nodeFormArray.push(srvFormGroup);
          srvFormGroup.from_object(data[key][index]);
          this._gatherFacts(srvFormGroup, srvFormGroup.deviceFacts, host_key, true);
          setTimeout(()=> {
            this.cephDriveSelected(data[key][index]['ceph_drives'], srvFormGroup);
          });
        }
      } 

      else if (key =='home_nets' && someFormObject instanceof FormArray){
        for (let index = 0; index < data[key].length; index++){          
          let homeNetFormGroup = new HomeNetFormGroup();
          homeNetFormGroup.home_net.setValue(data[key][index]['home_net']);
          someFormObject.push(homeNetFormGroup);
        }
      } else if (key === 'external_nets' && someFormObject instanceof FormArray){
        for (let index = 0; index < data[key].length; index++){
          let externalNetFormGroup = new ExternalNetFormGroup();
          externalNetFormGroup.external_net.setValue(data[key][index]['external_net']);
          someFormObject.push(externalNetFormGroup);
        }
      }
    }
  }

  ngOnInit() {
    this.title.setTitle("Kit Configuration");
    this.kitForm.addSensorFormGroup(null, null);
    this.kitForm.addServerFormGroup(null);
    this.kitForm.reset();    
  }

  ngAfterViewInit() {
    this.initalizeForm();
  }

  clearForm() {
    this.kitForm.reset();
    this.kitForm.enable();
    this.hasKitForm = false;
    this.isAddNodeInsteadOfNewKit = false;
    this.prepopulateFromKickstart();    
  }

  enableForm(){
    this.kitForm.enable();
  }

  private openKickstartErrorModal(): void {
    this.kitModal.updateModal('Error',
    "What are you doing? You cannot create a Kit until you have a Kickstart configuration. \
    Please click on the Kickstart Configuration first and finish that form first.",
    undefined,
    'Close');

    this.kitModal.openModal();
  }

  private prepopulateFromKickstart(){
    this.kickStartSrv.getKickstartForm().subscribe(data => {
      if (!data) {
        this.openKickstartErrorModal();
        return;
      }

      this.kitForm.root_password.setDefaultValue(data["root_password"]);
      for (let node of data["nodes"]) {
        this.appendNode(node);
      }
    });

    this.storageCalculator.recalculate_storage_recommendation();
  }

  openArchiveConfirmation(): void {
    this.archiveKitModal.updateModal('WARNING',
      'Are you sure you want to archive this form? Doing so will erase any fields \
      you have entered on the existing page but it will archive the form.',
      "Yes",
      'Cancel'
    )
    this.archiveKitModal.openModal();
  }

  archiveForm(): void {
    this.clearForm();
    this.kitSrv.removeKitInventoryAndArchive().subscribe(data => {});
  }

  openRestoreModal(){
    this.kitSrv.getArchivedKitForms().subscribe(data => {
      this.restoreModal.updateModal('Restore Form',
        'Please select an archived Kickstart form.  Keep in mind restoring a form will remove your current configuration.',
        "Restore",
        'Cancel'
      );
      this.restoreModal.updateModalSelection(data);
      this.restoreModal.openModal();
    });
  }
    
  restoreForm(formId: string){
    this.kitForm.addSensorFormGroup(null, null);
    this.kitForm.addServerFormGroup(null);
    this.kitForm.reset();
    this.kitSrv.restoreArchivedKitForm(formId).subscribe(data => {      
      this.initalizeForm();
    });
  }  

  onSubmit(){    
    this.executeKitModal.updateModal('WARNING',
      'Are you sure you want to execute this Kit configuration? Doing so will create a new cluster \
      with the configuration you created.  All data will be wiped out if you are running this on an existing cluster! \
      Before you can submit your Kit configuration, please make sure you enter the current UTC date and time below.  \
      This will set the master server in the cluster to the appropriate time before configuring the rest \
      of the Kit.',
      'Execute',
      'Cancel',
      ModalType.form,
      this.executeKitForm
    );
    this.executeKitModal.openModal();    
  }

  executeAddNode(){    
    let payload = {'kitForm': this.kitForm.getRawValue(), 'nodesToAdd': this.addNodeCache};
    this.kitSrv.executeAddNode(payload)
    .subscribe(data => {
      this.openConsole();
      this.addNodeCache = new Array();
    });    
  }

  executeKit(){
    console.log(this.executeKitForm.getRawValue());
    this.kitSrv.executeKit(this.kitForm.getRawValue(), 
                           this.executeKitForm.getRawValue()
                          )
    .subscribe(data => {
      this.openConsole();
    });
  }

  openConsole(){
    this.router.navigate(['/stdout/Kit'])
  }

  private appendNode(node: Object, disableIsKubernetesMasterCheckbox: boolean=false){
    if (node === undefined || node === null){
      return;
    }

    if (node["node_type"] === "Server") {
      this.kitForm.addServerFormGroup(node["ip_address"], disableIsKubernetesMasterCheckbox);
    } else if (node["node_type"] === "Sensor") {
      this.kitForm.addSensorFormGroup(node["ip_address"], 'Local');
    } else if (node["node_type"] === "Remote Sensor") {
      this.kitForm.addSensorFormGroup(node["ip_address"], 'Remote');
    } else {
      console.error("Unknown Node type." + node);
    }
  }

  private initalizeForm(): void {

    this.kickStartSrv.getKickstartForm().subscribe(kickstartData => {
      if (!kickstartData) {
        this.openKickstartErrorModal();        
        return;
      }

      this.kitSrv.getKitForm().subscribe(kitData => {
        if (kitData === null || kitData === undefined) {
          this.prepopulateFromKickstart();
          this.hasKitForm = false;
          this.isAddNodeInsteadOfNewKit = false;
          return;
        }

        this._map_to_form(kitData, this.kitForm, kitData['root_password']);
        this.hasKitForm = true;
        this.kitForm.disable();

        outer:
        for(let node of kickstartData['nodes']){

          for (let kitServer of kitData['servers']){
            if (kitServer["host_server"] === node["ip_address"]){
              continue outer;
            }
          }

          for (let kitServer of kitData['sensors']){
            if (kitServer["host_sensor"] === node["ip_address"]){
              continue outer;
            }
          }
          
          this.addNodeCache.push(node);
          this.appendNode(node, true);

          //We know here that we are adding nodes because our kickstart configuration is 
          //different from our kit configuration.
          this.isAddNodeInsteadOfNewKit = true;
        }

      });
    });    
  }

  toggleServer(server: ServerFormGroup) {
    server.hidden = !server.hidden;
  }

  toggleSensor(sensor: SensorFormGroup) {
    sensor.hidden = !sensor.hidden;
  }

  //TODO gathering facts twice after restore causes issues.
  private _gatherFacts(node: ServerFormGroup | SensorFormGroup, data: Object, host_key: string, runCalculations: boolean) {    
    if (data['error_message']) {
      this.kitModal.updateModal('Error',
        data['error_message'],
        undefined,
        'Close');

      this.kitModal.openModal();
      //End execution of this if we have errors.
      return;
    }
    
    node.deviceFacts = data;
    //Ensures we do not add additional compute power and memory by accident.
    if (runCalculations) {
      if (node instanceof ServerFormGroup) {
        node.setOptionSelections();
      } else if (node instanceof SensorFormGroup) {
        node.setSensorOptionsSelections(node[host_key].value);
      }
      node.basicNodeResource.setFromDeviceFacts(node.deviceFacts);

      this.kitForm.system_resources.setFromDeviceFacts(node.deviceFacts);
      node.hostname.setValue(node.deviceFacts["hostname"]);

      if (node instanceof ServerFormGroup) {
        this.kitForm.server_resources.setFromDeviceFacts(node.deviceFacts);
        this.kitForm.server_resources.setErrorsOrSuccesses(
          this.advancedElasticSearchForm.elastic_masters.value,
          this.advancedElasticSearchForm.elastic_datas.value,
          this.advancedElasticSearchForm.elastic_cpus.value,
          this.advancedElasticSearchForm.elastic_memory.value);
        this.elasicSearchCalculator.calculate();
        this.manualCalculator.validate_manual_entries();
      } else if (node instanceof SensorFormGroup) {
        this.kitForm.sensor_resources.setFromDeviceFacts(node.deviceFacts);
        this.molochBroCalculator.calculate_bro_and_moloch_threads();
      }
    }
  }

  gatherFacts(node: ServerFormGroup | SensorFormGroup) {
    let host_key: string = "host_server";
    if (node instanceof SensorFormGroup) {
      host_key = "host_sensor";
    }
    this.kickStartSrv.gatherDeviceFacts(node.value[host_key], this.kitForm.root_password.value)
    .subscribe(data => {
      let hasDeviceFacts: boolean = (node.deviceFacts != null);
      this._gatherFacts(node, data, host_key, !hasDeviceFacts);
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

  private _cephDriveSelected(drivesSelected: Array<string>, node: SensorFormGroup | ServerFormGroup): void {
    this.kitForm.system_resources.calculateTotalCephDrives(drivesSelected.length, node.deviceFacts);

    if (node instanceof SensorFormGroup){
      this.kitForm.sensor_resources.calculateClusterStorageAvailable(drivesSelected, node.deviceFacts);
    } else if (node instanceof ServerFormGroup){
      this.kitForm.server_resources.calculateClusterStorageAvailable(drivesSelected, node.deviceFacts);
    }

    this.setSystemClusterStorageAvailable();
  }

  cephDriveSelected(drivesSelected: Array<string>, node: SensorFormGroup | ServerFormGroup): void {
    this._cephDriveSelected(drivesSelected, node);
    this.storageCalculator.recalculate_storage_recommendation();    
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

  triggerValidations(event: any){
    this.manualCalculator.validate_manual_entries();
    this.elasicSearchCalculator.calculate();
  }

  private _remove_sensor_cluster_storage(deviceFacts: Object){
    if (deviceFacts != null){
      this.kitForm.system_resources.calculateTotalCephDrives(0, deviceFacts);
      this.kitForm.sensor_resources.removeClusterStorage(deviceFacts);
      this.setSystemClusterStorageAvailable();
      this.storageCalculator.recalculate_storage_recommendation();      
    }
  }
}
