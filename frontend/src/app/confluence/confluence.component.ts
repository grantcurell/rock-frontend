import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ConfluenceService }  from '../confluence.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-confluence',
  templateUrl: './confluence.component.html',
  styleUrls: ['./confluence.component.css']
})
export class ConfluenceComponent implements OnInit {
  spaceID: string;
  htmlContent: string;
  title: string;
  navBar: Object;

  lastElement;  

  @ViewChild('containerDiv')
  private containerDiv: ElementRef;

  constructor(private confluenceSrv: ConfluenceService, 
              private titleSrv: Title, 
              private route: ActivatedRoute) 
  {
    this.spaceID = '';
    this.title = "";
    this.htmlContent = "";
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.spaceID = params['id'];
      
      this.confluenceSrv.getNavBar(this.spaceID).subscribe(data => {
        this.navBar = data;
      });

      setTimeout(() => {
        this.scrollToNavElement("287891176");
      }, 1000);

    });    

    this.getPage(null, "287891176");
  }

  ngAfterViewInit(){
    this.resizeContainer();
  }

  /**
   * Triggers when the browser window resizes.
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event){
     this.resizeContainer();
  }

  private scrollToNavElement(page_id: string){
    let some_element = document.getElementById("a_" + page_id);
    some_element.scrollIntoView();
    some_element.style.fontWeight = "bold";
    some_element.style.color = "lightgreen";
    this.lastElement = some_element;
  }

  private resizeContainer(){
    let height: string = (window.innerHeight - 70) + "px";       
    this.containerDiv.nativeElement.style.height = height;
  }

  getPage(event: any, page_id: string){
    if (this.lastElement){
      this.lastElement.style.fontWeight = "";
      this.lastElement.style.color = "";
    }    

    if (event){
      event.srcElement.style.fontWeight = "bold";
      event.srcElement.style.color = "lightgreen";
      this.lastElement = event.srcElement;
    }

    this.confluenceSrv.getConfluencePage(this.spaceID, page_id).subscribe(data => {
      this.title = data['title'];
      this.titleSrv.setTitle(this.title);
      this.htmlContent = data['content'];
    });
  }
}
