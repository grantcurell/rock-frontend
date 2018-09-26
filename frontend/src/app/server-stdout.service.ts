import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface Message {
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class ServerStdoutService {

  constructor(private socket: Socket, private http: HttpClient) { }

  sendMessage(msg: string){
    this.socket.emit("message", msg);
  }

  getMessage(){
    return this.socket.fromEvent("message").pipe();
  }

  getConsoleOutput(jobName: string){
    const url = `/api/get_console_logs/${jobName}`;
    return this.http.get(url).pipe();
  }

  removeConsoleOutput(id_obj: {jobName: string, jobid: string}){
    const url = '/api/remove_console_output';
    return this.http.post(url, id_obj);
  }
}
