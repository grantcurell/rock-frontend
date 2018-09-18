import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

  gatherDeviceFacts(management_ip: string, password: string): Observable<Object> { 
    // const url = `/api/_gather_device_facts?management_ip=${management_ip}&password=${password}`
    // return this.http.get(url)
    //   .pipe(
    //     catchError(this.handleError('gatherDeviceFacts', []))
    //   );

    const url = '/api/gather_device_facts';
    let post_payload = {"management_ip": management_ip, "password": password};
    return this.http.post(url, post_payload , httpOptions).pipe(
      tap(data => this.mapDeviceFacts(data)),
      catchError(this.handleError('gatherDeviceFacts'))
    );
  }

  generateKickstartInventory(kickStartForm: Object){
    this.log(kickStartForm);
    const url = '/api/generate_kickstart_inventory';    
    
    return this.http.post(url, kickStartForm, httpOptions).pipe(
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

  restoreArchivedKickstartForm(archiveId: string): Observable<Object> {
    const url = '/api/restore_archived';
    let post_payload = {"_id": archiveId};    
    return this.http.post(url, post_payload , httpOptions)
      .pipe(
        catchError(this.handleError('gatherDeviceFacts', []))
      );
  }
  

  generateKitInventory(kitForm: Object){
    const url = '/api/generate_kit_inventory';
    return this.http.post(url, kitForm, httpOptions).pipe(
      catchError(this.handleError('generateKitInventory'))
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
