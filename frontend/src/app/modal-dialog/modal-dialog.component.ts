import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HtmlModalPopUp } from '../html-elements';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  @Input()
  modal: HtmlModalPopUp;

  @Output()
  primaryButtonClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  triggerPrimaryClickEvent(event: any){
    this.primaryButtonClick.emit(event);
  }

}
