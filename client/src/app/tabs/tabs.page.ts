import { SharedParamsService } from './../services/shared-params.service';
import { MoodGuardService } from './../services/mood-guard.service';
import { Component } from '@angular/core';
import { Platform, NavController, AlertController } from '@ionic/angular';

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

  constructor(private platform: Platform, private shared: SharedParamsService,
    private navCtrl: NavController, private alertController: AlertController,
    private moodGuard: MoodGuardService) {
    if (this.moodGuard.checkMood()) {
      if (!this.moodGuard.checkSameDay()) {
        this.alertNewDay();
      }
    }
    if (platform.is('cordova')) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      if (this.width > this.height) {
        const ratio = this.width / this.height;
        // landscape
        this.splashLandscape = true;
      } else {
        // portrait
        const ratio = this.height / this.width;
        this.splashPortrait = true;
        if (ratio < 2) {
          this.i = 1;
        } else {
          this.i = 2;
        }
      }
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.splashPortrait = false;
      this.splashLandscape = false;
    }, 4500);
  }

  // change your starting and target mood function
  goToMoodSet() {
    this.shared.removeCurrentMood();
    this.shared.removeTargetMood();
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
