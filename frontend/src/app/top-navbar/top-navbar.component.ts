import { Component, OnInit } from '@angular/core';
import { SetISMatrix } from '../globals';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements OnInit {
  matrixText: string;
  isMatrixOn: boolean;

  constructor() { 
    this.isMatrixOn = true;
    this.matrixText = "Turn off matrix";
  }

  ngOnInit() {}

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
