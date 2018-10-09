import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HtmlModalPopUp, ModalType } from '../html-elements';

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

  constructor() {}

  ngOnInit() {}

  objectKeys(obj: any) {
    let ret_val = [];
    for (let item of Object.keys(obj)){      
        ret_val.push(item);
    }
    return ret_val;
  }

  triggerPrimaryClickEvent(event: any){    
    this.primaryButtonClick.emit(event);
  }

  onSubmit(){
    this.primaryButtonClick.emit(this.modal.modalForm.value);
    this.modal.hideModal();
  }

  isCode(){
    return this.modal.type === ModalType.code;
  }

  isGeneral(){
    return this.modal.type === ModalType.general;
  }

  isError(){
    return this.modal.type === ModalType.error;
  }

  isFormType() {
    return this.modal.type === ModalType.form;
  }
}
