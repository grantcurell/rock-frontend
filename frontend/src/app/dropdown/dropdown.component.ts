import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { HtmlDropDown } from '../html-elements'

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  public uid: string;

  @Output()
  dropDownChanged: EventEmitter<any> = new EventEmitter();

  selectedValue: string;

  constructor() {
  }

  ngOnInit() {
    let dropDown: HtmlDropDown = this.parentForm.get(this.controlName) as HtmlDropDown;
    this.selectValue(dropDown.default_value);
  }

  selectValue(newValue: string){
    this.selectedValue = newValue;
    this.parentForm.get(this.controlName).setValue(this.selectedValue);
    this.triggerChangedEvent();
  }

  get input_control(): HtmlDropDown {
    return this.parentForm.get(this.controlName) as HtmlDropDown;
  }

  private triggerChangedEvent(){
    this.dropDownChanged.emit(this.selectedValue);
  }
}
