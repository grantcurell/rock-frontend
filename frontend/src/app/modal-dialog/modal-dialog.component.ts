import { Component, OnInit, Input } from '@angular/core';
import { HtmlModalPopUp } from '../html-elements';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  @Input()
  modal: HtmlModalPopUp;

  constructor() { }

  ngOnInit() {
  }

}
