import { AlertController } from '@ionic/angular';
import { SharedParamsService } from './shared-params.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ManumissionCheckService {

  constructor(private sharedParamsService: SharedParamsService, private alertController: AlertController) { }

  public isTampered() {
    if (this.sharedParamsService.getUserProfile() === null ||
      this.sharedParamsService.getCurrentMood() === null ||
      this.sharedParamsService.getTargetMood() === null ||
      this.sharedParamsService.getToken() === null ||
      this.sharedParamsService.getRefreshToken() === null ||
      this.sharedParamsService.getPreviousDay() === null ||
      this.sharedParamsService.getExpirationToken() === null
    ) {
      this.alertManumission();
      console.log(this.sharedParamsService.getUserProfile() + ', ' +
        this.sharedParamsService.getCurrentMood() + ', ' +
        this.sharedParamsService.getTargetMood() + ', ' +
        this.sharedParamsService.getToken() + ', ' +
        this.sharedParamsService.getRefreshToken() + ', ' +
        this.sharedParamsService.getPreviousDay() + ', ' +
        this.sharedParamsService.getExpirationToken());

      return true;
    }
    else {
      return false;
    }
  }

  /* ALERT CHECK EXPIRATION TOKEN */
  private async alertManumission() {
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
