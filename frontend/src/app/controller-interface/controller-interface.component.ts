import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-controller-interface',
  templateUrl: './controller-interface.component.html',
  styleUrls: ['./controller-interface.component.css']
})
export class ControllerInterfaceComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;  

  @Input()
  interfaceData: Array<Object>;

  selectedValue: string;  

  constructor() {}

  ngOnInit() {    
    this.interfaceData = this.interfaceData.filter(item => item['name'] != 'lo');    
  }

  //TODO fixed this later as this is not the proper way to do things in angular.
  private clear_selected_buttons(){
    let buttons = document.getElementById('button_group').children;
    for (let _index in buttons) {
      if (buttons[_index]['value']){
        buttons[_index]['value'] = buttons[_index]['value'].replace('- selected', '');
      }
    }
  }

  selectedButton(event, iface: Object) {
    this.clear_selected_buttons();
    event.srcElement.value = iface['name'] + ' - ' + iface['ip_address'] + ' - selected';
    this.set_selectedValue(iface['ip_address']);
  }

  private set_selectedValue(newValue: string){
    this.selectedValue = newValue;
    this.input_control.setValue(this.selectedValue);
  }

  get input_control() { 
     return this.parentForm.get(this.controlName);
  }
}
