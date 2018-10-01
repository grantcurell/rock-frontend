import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HtmlCardSelector } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-card-selector',
  templateUrl: './card-selector.component.html',
  styleUrls: ['./card-selector.component.css']
})
export class CardSelectorComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  optionSelections: Array<{ value: string, label: string }>;

  @Output()
  onSelect: EventEmitter<any> = new EventEmitter();

  @ViewChild('button_group')
  private buttonGroup: ElementRef;

  private htmlCardSelectorFormArray: HtmlCardSelector;

  constructor() { }

  ngOnInit() {
    console.log("ngOnInit()");
    this.htmlCardSelectorFormArray = this.parentForm.get(this.controlName) as HtmlCardSelector;
    //Fixes a bug when we rerender the same card selector.
    this.clearFormArray();
    this.setDefaultValues(this.htmlCardSelectorFormArray.default_selections);
  }

  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    let selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }

  private clearFormArray(){
    while(this.htmlCardSelectorFormArray.length !== 0){
      this.htmlCardSelectorFormArray.removeAt(0);
    }
  }

  private clearSelectedButtons() {        
    let buttons = this.buttonGroup['nativeElement']['children'];
    for (let _index in buttons) {
      if (buttons[_index]['value']) {
        buttons[_index]['value'] = buttons[_index]['value'].replace('- selected', '');
      }
    }
  }

  public setDefaultValues(selectedOptions: Array<string>){    
    this.clearFormArray();
    this.clearSelectedButtons();

    for (let default_value of selectedOptions){
      //this.optionSelections.push();
      this.set_selectedValue(default_value);
      for (let option of this.optionSelections){
        if (option.value == default_value){
          option.label = option.label + ' - selected';
        }
      }
    }
  }

  selectedButton(event, selection: { value: string, label: string }) {    
    if (!this.htmlCardSelectorFormArray.is_multi_select) {
      this.clearFormArray();
      this.clearSelectedButtons();
    }
        
    if (selection.label.indexOf('selected') > -1){
      selection.label = selection.label.replace(' - selected', '');
    }    

    if (event.srcElement.value.indexOf('selected') > -1) {
      //Only triggered when the selected word is in the value of the srcElement.
      event.srcElement.value = selection.label;
      this.deSelectValue(selection.value);
    } else {
      event.srcElement.value = selection.label + ' - selected';
      this.set_selectedValue(selection.value);
    }

    this.triggerOnSelectEvent();
  }

  private triggerOnSelectEvent(){    
    this.onSelect.emit(this.htmlCardSelectorFormArray.value);
  }

  private set_selectedValue(newValue: string) {    
    this.htmlCardSelectorFormArray.push(new FormControl(newValue));
  }

  private deSelectValue(value: string){
    let indexToDelete: number = -1;
    for (let index=0; index <  this.htmlCardSelectorFormArray.length; index++){
      if (this.htmlCardSelectorFormArray.at(index).value == value){
        indexToDelete = index;
        break;
      }
    }
    if (indexToDelete != -1){
      this.htmlCardSelectorFormArray.removeAt(indexToDelete);
    }
  }

  get input_control(): HtmlCardSelector {
    return this.htmlCardSelectorFormArray;
  }
}
