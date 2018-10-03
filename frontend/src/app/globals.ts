//declare var IS_MATRIX_ON: boolean;
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { HttpHeaders } from '@angular/common/http';

declare let window: any;
window.IS_MATRIX_ON = true;

export function SetISMatrix(newValue: boolean){
    window.IS_MATRIX_ON = newValue;
}

export function GetIsMatrix(){
    return window.IS_MATRIX_ON;
}

export const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
} 