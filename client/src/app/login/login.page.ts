import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {

  params: any;
  href: string;

  constructor(private shared: SharedParamsService,
    private navCtrl: NavController, private loadingCtrl: LoadingController) {
    this.params = this.getHashParams();
    // if already logged
    if (this.shared.getExpirationToken() !== null && this.params.access_token === undefined) {
      if (this.shared.checkExpirationToken()) {
        this.initializeHref();
        this.onClickLogin();
      }
      else {
        this.checkSettedMood();
      }
    }
    // if it's a redirect
    else if (this.params.access_token !== undefined) {
      this.presentLoading('Logging in ...').then(() => {
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
        this.checkSettedMood();
      }).finally(() => {
        this.loadingCtrl.dismiss();
      });
    }
    // if it's not a redirect or never logged wait button login pressed
    else {
      this.initializeHref();
    }
  }

  onClickLogin() {
    this.presentLoading('Awaiting for Moodify-Spotify Server ...').then(() => {
      window.location.href = this.href;
    });
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

  checkSettedMood() {
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

  initializeHref() {
    if (window.location.href.includes('localhost')) {
      this.href = 'http://localhost:8888/login';
    }
    else {
      this.href = 'https://moodify-spotify-server.herokuapp.com/login';
    }
  }

  async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }
}
