import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SetISMatrix } from '../globals';
import { ConfluenceService }  from '../confluence.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements OnInit {
  matrixText: string;
  isMatrixOn: boolean;
  spaces: Object;

  @ViewChild('navlist')
  navlist: ElementRef;
  
  constructor(private confluenceSrv: ConfluenceService,
              private route: ActivatedRoute) { 
    this.isMatrixOn = false;
    this.matrixText = "Turn on matrix";
  }

  ngOnInit() {
    this.confluenceSrv.getSpaces().subscribe(data => {
      this.spaces = data;
    });
  }

  clearPreviousActive(){
    if (this.navlist){
      let navChildren = this.navlist.nativeElement.children;
      for (let i = 0; i < navChildren.length; i++){
        navChildren[i].children[0]['className'] = "nav-link";        
      }
    }
  }

  setActive(event: any){
    this.clearPreviousActive();
    if (event){
      event['srcElement']['className'] = "nav-link active";
    }
  }

  toggleMatrix(){
    this.isMatrixOn = !this.isMatrixOn;
    SetISMatrix(this.isMatrixOn);
    if (this.isMatrixOn){
      this.matrixText = "Turn off matrix"
    } else {
      this.matrixText = "Turn on matrix"
    }    
  }
}
