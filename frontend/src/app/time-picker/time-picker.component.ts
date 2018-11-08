import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HtmlTimePicker } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit {

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

  get input_control(): HtmlTimePicker {
    return this.parentForm.get(this.controlName) as HtmlTimePicker;
  }

}
