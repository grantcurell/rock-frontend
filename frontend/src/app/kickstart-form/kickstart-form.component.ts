import { Component, OnInit } from '@angular/core';
import { HtmlModalPopUp, HtmlCheckBox, HtmlInput } from '../html-elements';
import { KickstartInventoryForm, NodeFormGroup, AdvancedSettingsFormGroup } from './kickstart-form';
import { KickstartService } from '../kickstart.service';
import { FormArray } from '@angular/forms';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-kickstart-form',
  templateUrl: './kickstart-form.component.html',
  styleUrls: ['./kickstart-form.component.css']
})
export class KickstartFormComponent implements OnInit {
  kickStartModal: HtmlModalPopUp;
  kickStartForm: KickstartInventoryForm;
  advancedSettingsFormGroup: AdvancedSettingsFormGroup;
  deviceFacts: Object;
  isPosted: Object;  

  //Magically Injected by Angular
  constructor(private kickStartSrv: KickstartService, private title: Title) {
    this.kickStartForm = new KickstartInventoryForm();
    this.advancedSettingsFormGroup = this.kickStartForm.get('advanced_settings') as AdvancedSettingsFormGroup;
    this.kickStartModal = new HtmlModalPopUp('kickstart_modal');
    this.kickStartModal.updateModal('Success',
      'Inventory file generated successfully! \
       File located at /opt/tfplenum-deployer/playbooks/inventory.yml. \
       You can now navigate away from the page.',
      undefined,
      'Close'
    );
  }

  /**
   * Executes after the constructor and after the view is rendered.
   */
  ngOnInit(): void {
    this.title.setTitle("Kickstart Configuration");
    this.gatherDeviceFacts();
  }

  gatherDeviceFacts(): void {
    //This is asynchronous so the browser will not block until this returns.
    this.kickStartSrv.gatherDeviceFacts("localhost", "")
      .subscribe(data => this.deviceFacts = data);
  }

  onSubmit(): void {    
    this.kickStartSrv.generateKickstartInventory(this.kickStartForm.value)
      .subscribe(data => this.isPosted = data);
    this.kickStartModal.openModal();
  }
  
  addNodes() {    
    let nodeNumber: number = +this.kickStartForm.get('number_of_nodes')['value'];
    this.kickStartForm.clearNodes();
    for (let _i = 0; _i < nodeNumber; _i++){
      this.kickStartForm.addNodeGroup();
    }
  }

  toggleNode(node: NodeFormGroup) {
    node.hidden = !node.hidden;
  }

  toggleAdvancedSettings(advancedForm: NodeFormGroup){
    advancedForm.hidden = !advancedForm.hidden;
  }

  get nodes() {
    return this.kickStartForm.get('nodes') as FormArray;
  }

  openModal() {
    this.kickStartModal.openModal();
  }


  toggleDownloadDependencies(isChecked) {
    let depCheckBox = this.advancedSettingsFormGroup.get('download_dependencies') as HtmlCheckBox;
    let isoURL = this.advancedSettingsFormGroup.get('iso_url') as HtmlInput;
    
    if (isChecked){      
      depCheckBox.checked = false;
      depCheckBox.setValue(false);
      depCheckBox.disable();
      isoURL.disable();
    } else {
      depCheckBox.enable();
      isoURL.enable();
    }    
  }
}
