import { NavController } from '@ionic/angular';
import { keyCurrentMood } from 'src/environments/environment';
import { keyToken, keyRefreshToken, keyExpirationToken, keyTargetMood, keyUserProfile } from './../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(private navCtrl: NavController) { }

  /* REMOVERS */
  public removeToken() {
    localStorage.removeItem(keyToken);
  }

  public removeRefreshToken() {
    localStorage.removeItem(keyRefreshToken);
  }

  public removeExpirationToken() {
    localStorage.removeItem(keyExpirationToken);
  }

  public removeCurrentMood() {
    localStorage.removeItem(keyCurrentMood);
  }

  public removeTargetMood() {
    localStorage.removeItem(keyTargetMood);
  }

  public removeUser() {
    localStorage.removeItem(keyUserProfile);
  }

  public removeAllShared() {
    this.removeToken();
    this.removeRefreshToken();
    this.removeExpirationToken();
    this.removeCurrentMood();
    this.removeTargetMood();
    this.removeUser();
  }

  logout() {
    this.removeAllShared();
    this.navCtrl.navigateRoot('/login');
  }
}
