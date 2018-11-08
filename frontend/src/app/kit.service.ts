import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HTTP_OPTIONS } from './globals';

@Injectable({
  providedIn: 'root'
})
export class KitService {

  constructor(private http: HttpClient) { }

  getKitForm(): Observable<Object>{
    const url = '/api/get_kit_form';
    return this.http.get(url).pipe();
  }

  removeKitInventoryAndArchive(): Observable<Object> {
    const url = '/api/remove_and_archive_kit';
    return this.http.post(url, null);
  }

  getArchivedKitForms(): Observable<Object>{
    const url = '/api/get_kit_archived';
    return this.http.get(url).pipe();
  }

  restoreArchivedKitForm(archiveId: string): Observable<Object> {
    const url = '/api/restore_archived_kit';
    let post_payload = {"_id": archiveId};
    return this.http.post(url, post_payload , HTTP_OPTIONS).pipe();
  }

  executeKit(kitForm: Object, timeForm: Object){
    const url = '/api/execute_kit_inventory';
    let payload: Object = {'kitForm': kitForm, 'timeForm': timeForm};
    return this.http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  executeAddNode(kitForm: Object){
    const url = '/api/execute_add_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe();
  }
  
}
