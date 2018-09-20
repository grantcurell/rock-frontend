import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const httpOptions2 = {
  headers: new HttpHeaders({ 
    'Access-Control-Allow-Origin':'*'    
  })
};

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
