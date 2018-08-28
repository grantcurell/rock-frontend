import {  FormArray, AbstractControl } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { INVALID_PASSWORD_MISMATCH } from '../frontend-constants'; 
import { NodeFormGroup } from './kickstart-form';

function _compare_field(nodes: FormArray, fieldName: string): { hasError: boolean, conflict: string } {
  if (nodes != null && nodes.length >= 2){
    for (let i = 0; i < nodes.length; i++){
      let nodeI = nodes.at(i);

      for (let x = (i + 1); x < nodes.length; x++) {
        let nodeX = nodes.at(x);
        if (nodeI.get(fieldName).valid && 
            nodeX.get(fieldName).valid &&
            nodeI.get(fieldName).value == nodeX.get(fieldName).value
            )
        {
          return {hasError: true, conflict: nodeI.get(fieldName).value };          
        }
      }
    }
  }
  return {hasError: false, conflict: null };
}

function _validateDhcp(control: AbstractControl, errors: Array<string>): void {
    let dhcp_start_ctrl = control.get('dhcp_start');
    let dhcp_end_ctrl = control.get('dhcp_end');

    if (dhcp_start_ctrl == null || dhcp_end_ctrl == null || 
        dhcp_start_ctrl.value == null || dhcp_end_ctrl.value == null){
        return;
    }

    let dhcp_start = dhcp_start_ctrl.value.split('.').map(Number);
    let dhcp_end = dhcp_end_ctrl.value.split('.').map(Number);

    if(dhcp_start[0] == dhcp_end[0] && dhcp_start[1] == dhcp_end[1] && dhcp_start[2] == dhcp_end[2]){
        if(dhcp_start[3] < dhcp_end[3]){
            return;
        }
    }
    errors.push("- Invalid DHCP Range - Verify dhcp start and end fields.");
}

function _validateDhcpRange(control: AbstractControl, errors: Array<string>): void {

    let controller_interface_ctrl = control.get('controller_interface') as FormArray;
    if (controller_interface_ctrl == null || controller_interface_ctrl.at(0) == null){
        return;
    }

    let controller_interface_ip = controller_interface_ctrl.at(0).value;
    let dhcp_start_ctrl = control.get('dhcp_start');
    let dhcp_end_ctrl = control.get('dhcp_end');

    if (dhcp_start_ctrl == null || dhcp_start_ctrl.value == null || 
        dhcp_end_ctrl == null || dhcp_end_ctrl.value == null){
        return;
    }

    let dhcp_start = dhcp_start_ctrl.value.split('.').map(Number);
    let dhcp_end = dhcp_end_ctrl.value.split('.').map(Number);
    let controller_ip = controller_interface_ip.split('.').map(Number);

    if (controller_ip[0] == dhcp_start[0] && controller_ip[1] == dhcp_start[1] && controller_ip[2] == dhcp_start[2] && controller_ip[0] == dhcp_end[0] && controller_ip[1] == dhcp_end[1] && controller_ip[2] == dhcp_end[2]) {
        if (controller_ip[3] < dhcp_start[3] || controller_ip[3] > dhcp_end[3]) {
            return;
        } else {
            errors.push("- The selected Controller Interface " + controller_interface_ip + " cannot be within the DHCP range " + dhcp_start_ctrl.value + " - " + dhcp_end_ctrl.value);            
        }
    }
    else {
        errors.push("- DHCP range must be on the same network as the selected Controller Interface " + controller_interface_ip);
    }
}

function _validateNodes(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as FormArray;
    let has_servers = false;
    let has_sensors = false;

    if (nodes == null){
        return null;
    }

    if (nodes.length < 2){
        errors.push("- A minimum of two nodes is required before submitting this form.");
    }

    for (let i = 0; i < nodes.length; i++){
        let node = nodes.at(i) as NodeFormGroup;
        if (node.node_type.value == node.node_type.options[0]){
            has_servers = true;
        } else if (node.node_type.value == node.node_type.options[1]){
            has_sensors = true;
        }
        if (has_servers && has_sensors){
            return;
        }
    }

    errors.push("- A minium of one server and one sensor is required for the Kickstart configuration.");
}
  
export function ValidateKickStartInventoryForm(control: AbstractControl){
  let dhcp_start = control.get('dhcp_start');
  let dhcp_end = control.get('dhcp_end');

  let root_password = control.get('root_password') as HtmlInput;
  let re_password = control.get('re_password') as HtmlInput;

  let nodes = control.get('nodes') as FormArray;
  let ip_check = _compare_field(nodes, 'ip_address');
  let mac_check = _compare_field(nodes, 'mac_address');
  let host_check = _compare_field(nodes, 'hostname');
  let errors = [];
    
  if (ip_check.hasError) {
    errors.push("- Duplicate IP addresses found: " + ip_check.conflict + " Nodes must have a unique ip address.")          
  }
  if (mac_check.hasError) {
    errors.push("- Duplicate mac addresses found: " + mac_check.conflict + " Nodes must have a unique mac address.")
  }
  if (host_check.hasError) {
    errors.push("- Duplicate hostnames found: " + host_check.conflict + " Node must have a unique hostnames.")
  }

  if (dhcp_start != null && dhcp_end != null){
    if (dhcp_end.value == dhcp_start.value){
      errors.push("- DHCP start and end addresses cannot be the same.");
    } 
  }
  
  if (root_password != null && re_password != null){
    if (root_password.value != re_password.value){
      //Sets the Error message at the formControl Level
      re_password.setErrors({ custom_error: INVALID_PASSWORD_MISMATCH});

      //Sets the error message at the formGroup Level.  There is a validation box where this will appear.
      errors.push("- The passwords you entered do not match.  Please retype them carefully.");
    } 
  }

  _validateDhcp(control, errors);
  _validateDhcpRange(control, errors);
  _validateNodes(control, errors);

  if (errors.length > 0){
    return { errors: errors};
  }
  
  return null;
}
