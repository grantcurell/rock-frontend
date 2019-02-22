import { Component, OnInit } from '@angular/core';
import { PortalService } from '../portal.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent implements OnInit {  
  links: Array<{ip: string, dns: string, logins: string}>;

  constructor(private portalSrv: PortalService, private title: Title) { 
    this.links = new Array();
  }

  ngOnInit() {
    this.title.setTitle("Portal");
    this.portalSrv.getPortalLinks().subscribe(data => {
      let portalLinks = data as Array<{ip: string, dns: string, logins: string}>;
      this.links = portalLinks;
    });
  }

}
