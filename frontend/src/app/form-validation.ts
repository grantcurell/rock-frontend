import {  FormArray, AbstractControl } from '@angular/forms';
import { HtmlInput } from './html-elements';
import { INVALID_PASSWORD_MISMATCH } from './frontend-constants'; 

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

  if (errors.length > 0){
    return { errors: errors};
  }
  
  return null;
}

export function ValidatePassword(control: AbstractControl){

} 