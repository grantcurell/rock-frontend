import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PortalService {

  constructor(private http: HttpClient) { }

  getPortalLinks(){    
    const url = '/api/get_portal_links';
    return this.http.get(url).pipe();
  }
}
