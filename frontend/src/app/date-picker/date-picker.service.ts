import {Injectable} from "@angular/core";
import {NgbDate} from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: 'root'
})
export class DatePickerService {
  public date: NgbDate;

  public setDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getUTCDate();
      console.log(year, month, day);
      this.date = new NgbDate(year, month, day);
  }
}
