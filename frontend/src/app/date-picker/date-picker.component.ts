import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HtmlDatePicker } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  public uid: string;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    let selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }

  get input_control(): HtmlDatePicker {
    return this.parentForm.get(this.controlName) as HtmlDatePicker;
  }
}
