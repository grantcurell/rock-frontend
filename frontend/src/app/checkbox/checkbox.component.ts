import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HtmlCheckBox } from '../html-elements';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Output()
  is_checked: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  get input_control(): HtmlCheckBox {
    return this.parentForm.get(this.controlName) as HtmlCheckBox;
  }

  callParent(event){    
    this.is_checked.emit(this.input_control.value);
  }
}
