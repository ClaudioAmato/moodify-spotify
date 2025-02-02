import { ManumissionCheckService } from './../../services/manumission-check.service';
import { EmojisService } from './../../services/emojis.service';
import { LogoutService } from './../../services/logout.service';
import { NavController, AlertController } from '@ionic/angular';
import { SharedParamsService } from './../../services/shared-params.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-change-mood',
  templateUrl: 'change-mood.page.html',
  styleUrls: ['change-mood.page.scss']
})
export class ChangeMoodPage {
  currentEmotion: { name: string, image: string };
  targetEmotion: { name: string, image: string };

  constructor(private shared: SharedParamsService, private navCtrl: NavController,
    private alertController: AlertController, private logoutService: LogoutService,
    private emoji: EmojisService, private manumission: ManumissionCheckService) {
    if (!this.manumission.isTampered()) {
      this.initializeImages();
    }
  }

  // initialize image
  initializeImages() {
    this.currentEmotion = this.emoji.getArrayEmoji().find(emotion => emotion.name === this.shared.getCurrentMood());
    this.targetEmotion = this.emoji.getArrayEmoji().find(emotion => emotion.name === this.shared.getTargetMood());
  }

  // change your starting and target mood function
  goToMoodSet() {
    this.logoutService.removeCurrentMood();
    this.logoutService.removeTargetMood();
    this.navCtrl.navigateRoot('/mood');
  }

  // Logout form the website
  logout() {
    this.logoutService.logout();
  }

  /** ALERTS */
  /* ALERT LOGOUT */
  async alertLogout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      cssClass: 'alertClassWarning',
      message: 'Are you sure to logout?',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertMedium',
          handler: () => {
            this.logout();
          }
        },
        {
          text: 'Cancel',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();
  }

  /* ALERT CHANGE MOOD */
  async alertMood() {
    const alert = await this.alertController.create({
      header: 'MOOD',
      cssClass: 'alertClass',
      message: 'Do you want to change your starting and target mood?',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertMedium',
          handler: () => {
            this.goToMoodSet();
          }
        },
        {
          text: 'Cancel',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();
  }

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }
}
