import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { HtmlModalSelectDialog } from '../html-elements';

@Component({
  selector: 'app-modal-ip-select-dialog',
  templateUrl: './modal-ip-select-dialog.component.html',
  styleUrls: ['./modal-ip-select-dialog.component.css']
})
export class ModalIpSelectDialogComponent implements OnInit {

  @ViewChild('selections')
  selections: ElementRef;

  @Input()
  modal: HtmlModalSelectDialog;

  @Output()
  primaryButtonClick: EventEmitter<any> = new EventEmitter();  

  constructor() {}

  ngOnInit() {
  }

  onRadioSelect(event: any){
    this.modal.isDisabled = false;    
  }

  triggerPrimaryClickEvent(){
    for (let item of this.selections['nativeElement']['children']){
      let input = item['children'][0].children[0]
      if (input.checked){
        this.primaryButtonClick.emit(input.value);
      }
    }
  }

}
