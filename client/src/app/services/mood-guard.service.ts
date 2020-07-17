import { SharedParamsService } from './shared-params.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MoodGuardService {

  constructor(private shared: SharedParamsService) { }

  checkMood() {
    if (this.shared.getCurrentMood() == null || this.shared.getTargetMood() == null) {
      return true;
    }
    else {
      return false;
    }
  }

  checkSameDay() {
    const today = new Date();
    const someDate = new Date(JSON.parse(JSON.stringify(this.shared.getPreviousDay())));
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  }
}
