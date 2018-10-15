import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';


@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css']
})
export class TerminalComponent implements OnInit {

  @ViewChild('terminal')
  private terminalIframe: ElementRef;
  terminalURL: string;

  constructor() { }

  ngOnInit() {
    let hostname = window.location.hostname;
    this.terminalURL = `https://${hostname}:9090/cockpit/@localhost/system/terminal.html`;
  }


  ngAfterViewInit(){
    this.resizeTerminal();
  }

  /**
   * Triggers when the browser window resizes.
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event){
     //console.log("Width: " + event.target.innerWidth);
     this.resizeTerminal();
  }

  private resizeTerminal(){
    let height: string = "";
    if (window.innerHeight > 400){
      height = (window.innerHeight - 100) + "px";
    } else {
      height = "100px";
    }      
    this.terminalIframe.nativeElement.style.maxHeight = height;
    this.terminalIframe.nativeElement.style.height = height;
  }

}
