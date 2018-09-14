import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class ConfluenceService {

  constructor(private http: HttpClient) { }

  getConfluencePage(space_id: string, page_id: string): Observable<Object> {
    const url = `/api/get_confluence_page/${space_id}/${page_id}`
    return this.http.get(url).pipe();
  }

  getNavBar(space_id: string) {
    const url = `/api/get_navbar/${space_id}`
    return this.http.get(url).pipe();
  }

  getSpaces(){
    const url = '/api/get_spaces';
    return this.http.get(url).pipe();
  }
}
