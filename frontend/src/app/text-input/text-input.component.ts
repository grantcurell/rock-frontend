import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent implements OnInit {
  
  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Output()
  buttonClick: EventEmitter<any> = new EventEmitter();

  @Output()
  keyupEvent: EventEmitter<any> = new EventEmitter();
  
  constructor() { }

  ngOnInit() { }

  callParent(){    
    this.buttonClick.emit(null);
  }

  callParentKeyUp(event: any){
    this.keyupEvent.emit(event);
  }

  get input_control() {
    return this.parentForm.get(this.controlName);
  }

}
