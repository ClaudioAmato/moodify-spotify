import { AlertController } from '@ionic/angular';
import { SharedParamsService } from './shared-params.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ManumissionCheckService {

  constructor(private sharedParamsService: SharedParamsService, private alertController: AlertController) { }

  public checkManumission() {
    if (this.sharedParamsService.getUserProfile() === null ||
      this.sharedParamsService.getCurrentMood() === null ||
      this.sharedParamsService.getTargetMood() === null ||
      this.sharedParamsService.getToken() === null ||
      this.sharedParamsService.getRefreashToken() === null ||
      this.sharedParamsService.getPreviousDay() === null ||
      this.sharedParamsService.getExpirationToken() === null
    ) {
      this.alertManumission();
    }
  }

  /* ALERT CHECK EXPIRATION TOKEN */
  async alertManumission() {
    const alert = await this.alertController.create({
      header: 'Error',
      cssClass: 'alertClassError',
      message: 'Please do not delete nothing in localstorage!',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
          handler: () => {
            if (window.location.href.includes('localhost')) {
              window.location.href = 'http://localhost:8888/login';
            }
            else {
              window.location.href = 'https://moodify-spotify-server.herokuapp.com/login';
            }
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
}
