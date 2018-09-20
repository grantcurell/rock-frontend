import { Component, OnInit } from '@angular/core';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent implements OnInit {  
  links: Array<{ip: string, dns: string}>;

  constructor(private portalSrv: PortalService) { 
    this.links = new Array();
  }

  ngOnInit() {    
    this.portalSrv.getPortalLinks().subscribe(data => {
      let portalLinks = data as Array<{ip: string, dns: string}>;
      for (let link of portalLinks){
        
        if (link.dns == "kubernetes-dashboard.lan"){
          this.links.push({ip: "https://" + link.ip, dns: "https://" + link.dns});
        } else {
          this.links.push({ip: "http://" + link.ip, dns: "http://" + link.dns});
        }
      }
      
    });
  }

}
