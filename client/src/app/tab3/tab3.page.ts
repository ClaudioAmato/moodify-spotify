import { NavController, AlertController } from '@ionic/angular';
import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private shared: SharedParamsService, private navCtrl: NavController,
    private alertController: AlertController) {

  }

  // change your starting and target mood function
  goToMoodSet() {
    this.shared.removeCurrentMood();
    this.shared.removeTargetMood();
    this.navCtrl.navigateRoot('/mood');
  }

  // Logout form the website
  logout() {
    this.shared.removeToken();
    this.shared.removeRefreashToken();
    this.shared.removeExpirationToken();
    this.shared.removeCurrentMood();
    this.shared.removeTargetMood();
    window.location.href = 'http://localhost:8100/login';
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
