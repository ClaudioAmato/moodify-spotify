import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {

  params: any;
  href: string;

  constructor(private shared: SharedParamsService,
    private navCtrl: NavController) {
    this.params = this.getHashParams();
    if (this.params.access_token !== undefined) {
      window.history.replaceState({}, document.title, '/' + 'login');
      if (this.shared.getExpirationToken() !== null) {
        this.shared.setPreviousDay(this.shared.getExpirationToken());
      }
      else {
        this.shared.setPreviousDay(new Date());
      }
      this.shared.setExpirationToken(new Date());
      this.shared.setToken(this.params.access_token);
      this.shared.setRefreashToken(this.params.refresh_token);
      if (
        this.shared.getCurrentMood() !== null &&
        this.shared.getTargetMood() !== null
      ) {
        this.navCtrl.navigateRoot('/moodify/home');
      }
      else {
        this.navCtrl.navigateRoot('/mood');
      }
    }
    if (window.location.href.includes('localhost')) {
      this.href = 'http://localhost:8888/login';
    }
    else {
      this.href = 'https://moodify-spotify-server.herokuapp.com/login';
    }
  }

  onClickLogin() {
    window.location.href = this.href;
  }


  getHashParams() {
    let hashParams = {};
    let e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }
}
