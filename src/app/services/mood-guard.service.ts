import { NavController } from '@ionic/angular';
import { SharedParamsService } from './shared-params.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MoodGuardService {

  constructor(private shared: SharedParamsService, private navCtrl: NavController) { }

  checkMood() {
    if (this.shared.getCurrentMood() == null || this.shared.getTargetMood() == null) {
      this.navCtrl.navigateRoot('/mood');
    }
  }
}
