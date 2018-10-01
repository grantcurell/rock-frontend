import { Component, OnInit, ViewChild } from '@angular/core';
import { HtmlModalPopUp, HtmlDropDown, HtmlCardSelector, HtmlModalSelectDialog } from '../html-elements';
import { KickstartInventoryForm, NodeFormGroup, AdvancedSettingsFormGroup } from './kickstart-form';
import { KickstartService } from '../kickstart.service';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CardSelectorComponent } from '../card-selector/card-selector.component';
import { Router } from '@angular/router';

const NODE_PATTERN = new RegExp('^(server|sensor)[0-9]+[.]lan$');

@Component({
  selector: 'app-kickstart-form',
  templateUrl: './kickstart-form.component.html',
  styleUrls: ['./kickstart-form.component.css']
})
export class KickstartFormComponent implements OnInit {
  kickStartModal: HtmlModalPopUp;
  kickStartForm: KickstartInventoryForm;
  restoreModal: HtmlModalSelectDialog;
  advancedSettingsFormGroup: AdvancedSettingsFormGroup;
  deviceFacts: Object;

  @ViewChild('cardSelector')
  monitorInterfaceSelector: CardSelectorComponent;

  //Magically Injected by Angular
  constructor(private kickStartSrv: KickstartService,
              private title: Title,
              private router: Router)
  {
    this.kickStartForm = new KickstartInventoryForm();
    this.advancedSettingsFormGroup = this.kickStartForm.get('advanced_settings') as AdvancedSettingsFormGroup;
    this.kickStartModal = new HtmlModalPopUp('kickstart_modal');
    this.restoreModal = new HtmlModalSelectDialog('restore_modal')
  }

  private _fill_up_array(formArrayLength: number){
    for (let i = 0; i < formArrayLength; i++){
      this.kickStartForm.addNodeGroup();
    }
  }

  private _set_form_control(control: FormControl | HtmlDropDown, value: any){
    if (control instanceof HtmlDropDown){
      control.default_value = value;
      control.setValue(value);

    } else if (control instanceof FormControl){
      control.setValue(value);
    }
  }

  /**
   * Maps our saved form object to view.
   *
   * @param data - The data to map
   * @param formGroup - The form group we are mapping our data too.
   */
  private _map_to_form(data: Object, formGroup: FormGroup){
    for (let key in data){
      let someFormObject = formGroup.get(key);

      if (someFormObject instanceof FormControl){
        this._set_form_control(someFormObject, data[key]);

      } else if (someFormObject instanceof FormGroup){
        this._map_to_form(data[key], someFormObject);

      } else if (someFormObject instanceof HtmlCardSelector){
        this.monitorInterfaceSelector.setDefaultValues(data[key]);
      } else if (someFormObject instanceof FormArray && data[key] instanceof Array){
        this._fill_up_array(data[key].length);

        for (let index = 0; index < data[key].length; index++){
          let someFormArrayObj = someFormObject.at(index);
          if (someFormArrayObj instanceof FormControl){
            this._set_form_control(someFormArrayObj, data[key][index]);
          } else if (someFormArrayObj instanceof FormGroup){
            this._map_to_form(data[key][index], someFormArrayObj);
          }
        }
      }
    }
  }

  /**
   * Executes after the constructor and after the view is rendered.
   */
  ngOnInit(): void {
    this.title.setTitle("Kickstart Configuration");
  }

  ngAfterViewInit(){
    this.initializeView();
  }

  private initalizeForm(): void {
    this.kickStartSrv.getKickstartForm().subscribe(data => {

      if (this.monitorInterfaceSelector == undefined){
        return;
      }
      this._map_to_form(data, this.kickStartForm);
      //Fixes a bug so that I do not have to touch the box.
      this.kickStartForm.re_password.updateValueAndValidity();
    });
  }

  private initializeView(): void {
    //This is asynchronous so the browser will not block until this returns.
    this.kickStartSrv.gatherDeviceFacts("localhost", "")
      .subscribe(data => {
        this.deviceFacts = data;
        this.kickStartForm.setInterfaceSelections(this.deviceFacts);
        //this.initalizeForm();
      });
  }

  onSubmit(): void {
    this.kickStartSrv.generateKickstartInventory(this.kickStartForm.value)
      .subscribe(data => {
        this.openConsole();
    });
  }

  openConsole(){
    this.router.navigate(['/stdout/Kickstart'])
  }

  addNodes() {
    let nodeNumber: number = +this.kickStartForm.get('number_of_nodes')['value'];
    this.kickStartForm.clearNodes();
    for (let _i = 0; _i < nodeNumber; _i++){
      this.kickStartForm.addNodeGroup();
    }
  }

  removeNode(index: number){
    this.kickStartForm.nodes.removeAt(index);
  }

  addNode(){
    this.kickStartForm.addNodeGroup();
  }

  toggleNode(node: NodeFormGroup) {
    node.hidden = !node.hidden;
  }

  toggleAdvancedSettings(){
    this.advancedSettingsFormGroup.hidden = !this.advancedSettingsFormGroup.hidden;
  }

  get nodes() {
    return this.kickStartForm.get('nodes') as FormArray;
  }

  openResetConfirmation() {
    this.kickStartModal.updateModal('WARNING',
      'Are you sure you want to archive this form? Doing so will erase any fields \
      you have entered on the existing page but it will archive the form.',
      "Yes",
      'Cancel'
    )
    this.kickStartModal.openModal();
  }

  openRestoreModal(){
    console.log('openRestoreModal')

    this.kickStartSrv.getArchivedKickstartForms().subscribe(data => {
      this.restoreModal.updateModal('Restore Form',
        'Please select an archived Kickstart form.  Keep in mind restoring a form will remove your current configuration.',
        "Restore",
        'Cancel'
      );
      this.restoreModal.updateModalSelection(data);
      this.restoreModal.openModal();
    });
  }

  resetForm(){
    this.kickStartForm.reset();
    this.kickStartSrv.removeKickstartInventoryAndArchive().subscribe(data => {});
  }

  restoreForm(formId: string){
    this.kickStartSrv.restoreArchivedKickstartForm(formId).subscribe(data => {
      this.kickStartForm.reset();
      this.initalizeForm();
    });
  }

  private _resetNodes(srvOrSensors: Array<NodeFormGroup>, isServer: boolean) {
    for (let i = 0; i < srvOrSensors.length; i++) {
      let node: NodeFormGroup = srvOrSensors[i];
      let isMatch = NODE_PATTERN.test(node.hostname.value);

      if (node.hostname.value == "" || isMatch == true) {
        if (isServer) {
          let newHostName: string = "server" + (i + 1) + '.lan';
          node.hostname.setValue(newHostName);
        } else {
          let newHostName: string = "sensor" + (i + 1) + '.lan';
          node.hostname.setValue(newHostName);
        }
      }
    }
  }

  /**
   * Triggered when a user selects a new nodeType for a given node.
   *
   * @param value - The new value of the dropdown.
   * @param index - The current index the node is in the list.
   */
  nodeTypeChange(value: string, index: number): void {
    let sensorArray:Array<NodeFormGroup> = [];
    let serverArray:Array<NodeFormGroup> = [];

    for (let i = 0; i < this.kickStartForm.nodes.length; i++) {
      let node = this.kickStartForm.nodes.at(i) as NodeFormGroup;

      if (node.node_type.value == "Server"){
        serverArray.push(node);
      } else if  (node.node_type.value == "Sensor"){
        sensorArray.push(node);
      }
    }

    this._resetNodes(sensorArray, false);
    this._resetNodes(serverArray, true);
  }

}
