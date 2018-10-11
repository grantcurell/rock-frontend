import { Component, OnInit } from '@angular/core';
import { KickstartInventoryForm, NodeFormGroup } from '../kickstart-form/kickstart-form';
import {ActivatedRoute} from '@angular/router';
import { KitInventoryForm, SensorFormGroup, ServerFormGroup } from '../kit-form/kit-form';
import { FormControl, FormArray } from '@angular/forms';
import { WHAT_IS_CEPH, HELP_ME_DECIDE } from '../frontend-constants'; 
import { Title } from '@angular/platform-browser';

class HelpForm {
  what_is_ceph = WHAT_IS_CEPH;
  help_me_decide = HELP_ME_DECIDE;            

  constructor(){}
}

declare var $: any;

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  form: HelpForm;
  kickstart: KickstartInventoryForm;
  kickstartNode: NodeFormGroup;
  kitForm: KitInventoryForm;
  kitServer: ServerFormGroup;
  kitSensor: SensorFormGroup;
  
  private fragment: string;
  
  constructor(private route: ActivatedRoute, private title: Title) {
    this.kickstart = new KickstartInventoryForm();
    this.kickstartNode = new NodeFormGroup(true);
    this.kitForm = new KitInventoryForm();
    this.kitServer = new ServerFormGroup(true, null);
    this.kitSensor = new SensorFormGroup(true, null, null);
    this.form = new HelpForm();
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  objectKeys(obj: any){
    let ret_val = [];
    for (let item of Object.keys(obj)){
      if (obj[item] instanceof FormControl || obj[item] instanceof FormArray){
        ret_val.push(item);
      }
    }
    return ret_val;
  }

  ngOnInit() {
    this.title.setTitle("Help");
  }

  ngAfterViewInit() {
    if (this.fragment){      
      let elementRef = document.querySelector('#' + this.fragment);
      elementRef.scrollIntoView();
      setTimeout(() => {
        window.scrollBy(0, -80);        
      }, 1000);
    }
        
    $('.tooltip').remove();
  }
}
