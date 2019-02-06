import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HTTP_OPTIONS } from './globals';


@Injectable({
  providedIn: 'root'
})
export class KickstartService {

  constructor(private http: HttpClient) { }

  public log(something: any){
    console.log(something);
    console.log(something.constructor.name);
  }

  private mapDeviceFacts(data){
    //TODO: is there a better way to do this? Look into map function later
    if (data == undefined || data == null){
      return;
    }
    
    if (data.disks){
      data['disks'] = JSON.parse(data.disks);
    }

    if (data.interfaces){
      data['interfaces'] = JSON.parse(data.interfaces);
    }    
  }

  getAvailableIPBlocks(): Observable<Object> {
    const url = '/api/get_available_ip_blocks';
    return this.http.get(url).pipe();
  }

  gatherDeviceFacts(management_ip: string, password: string): Observable<Object> {
    const url = '/api/gather_device_facts';
    let post_payload = {"management_ip": management_ip, "password": password};
    return this.http.post(url, post_payload , HTTP_OPTIONS).pipe(
      tap(data => this.mapDeviceFacts(data)),
      catchError(this.handleError('gatherDeviceFacts'))
    );
  }

  generateKickstartInventory(kickStartForm: Object){
    const url = '/api/generate_kickstart_inventory';    
    
    return this.http.post(url, kickStartForm, HTTP_OPTIONS).pipe(
      catchError(this.handleError('generateKickstartInventory'))
    );
  }

  removeKickstartInventoryAndArchive(){
    const url = '/api/remove_and_archive_kickstart';
    return this.http.post(url, null);
  }

  getKickstartForm(){
    const url = '/api/get_kickstart_form';
    return this.http.get(url)
      .pipe(        
        catchError(this.handleError('gatherDeviceFacts', []))
      );
  }

  getArchivedKickstartForms(): Observable<Object> {
    const url = '/api/get_kickstart_archived';
    return this.http.get(url)
      .pipe(
        catchError(this.handleError('gatherDeviceFacts', []))
      );
  }

  getUnusedIPAddresses(mng_ip: string, netmask: string): Observable<Object> {
    const url = '/api/get_unused_ip_addrs';
    let post_payload = {'mng_ip': mng_ip, 'netmask': netmask};
    return this.http.post(url, post_payload, HTTP_OPTIONS)
      .pipe(
        catchError(this.handleError('gatherDeviceFacts', []))
      );
  }

  restoreArchivedKickstartForm(archiveId: string): Observable<Object> {
    const url = '/api/restore_archived';
    let post_payload = {"_id": archiveId};
    return this.http.post(url, post_payload , HTTP_OPTIONS)
      .pipe(
        catchError(this.handleError('gatherDeviceFacts', []))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
 
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
