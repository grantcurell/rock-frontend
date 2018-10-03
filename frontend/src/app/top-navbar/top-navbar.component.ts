import { Component, OnInit } from '@angular/core';
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

  constructor(private confluenceSrv: ConfluenceService,
              private route: ActivatedRoute) { 
    this.isMatrixOn = true;
    this.matrixText = "Turn off matrix";
  }

  ngOnInit() {
    this.confluenceSrv.getSpaces().subscribe(data => {
      this.spaces = data;
    });
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
