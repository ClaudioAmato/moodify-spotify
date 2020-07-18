import { LogoutService } from './../services/logout.service';
import { SharedParamsService } from './../services/shared-params.service';
import { MoodGuardService } from './../services/mood-guard.service';
import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  splashPortrait = false;
  splashLandscape = false;
  width: number;
  height: number;
  i: number;

  constructor(private shared: SharedParamsService, private logoutService: LogoutService,
    private navCtrl: NavController, private alertController: AlertController,
    private moodGuard: MoodGuardService) {
    if (this.moodGuard.checkMood()) {
      if (window.location.href.includes('localhost')) {
        window.location.href = 'http://localhost:8100/mood';
      }
      else {
        window.location.href = 'https://moodify-spotify.web.app/mood';
      }
    } else {
      if (!this.moodGuard.checkSameDay()) {
        this.alertNewDay();
      }
    }
  }

  // change your starting and target mood function
  goToMoodSet() {
    this.logoutService.removeCurrentMood();
    this.logoutService.removeTargetMood();
    this.shared.setPreviousDay(this.shared.getExpirationToken());
    this.navCtrl.navigateRoot('/mood');
  }

  /** ALERTS */
  /* ALERT NEW DAY NEW MOOD */
  async alertNewDay() {
    const alert = await this.alertController.create({
      header: 'Here you go again!',
      cssClass: 'alertClassPrimary',
      message: 'It seems it\'s a new day.<br/><br/>' +
        'Are you still ' + this.shared.getCurrentMood().toUpperCase() + '<br/>' +
        'and your target is ' + this.shared.getTargetMood().toUpperCase() + '?',
      buttons: [
        {
          text: 'Change them!',
          cssClass: 'alertMedium',
          handler: () => {
            this.goToMoodSet();
          }
        },
        {
          text: 'Keep them!',
          cssClass: 'alertConfirm',
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
}
