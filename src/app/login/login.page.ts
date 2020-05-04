import { keyRefreshToken, keyToken, keyExpirationToken, keyCurrentMood, keyTargetMood } from './../../environments/environment';
import { SharedParamsService } from './../services/shared-params.service';
import { IP_geolocalization } from './../services/IP_geolocalization.service';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [IP_geolocalization]
})
export class LoginPage implements OnInit {

  country_code: string = '';
  params: any;

  constructor(private shared: SharedParamsService, private geoLocal: IP_geolocalization, private navCtrl: NavController) {
    this.params = this.getHashParams();
    if (this.params.access_token !== undefined) {
      window.history.replaceState({}, document.title, '/' + 'login');
      this.shared.setExpirationToken(new Date());
      this.shared.setToken(this.params.access_token);
      this.shared.setRefreashToken(this.params.refresh_token);
      if (
        this.shared.getCurrentMood() !== null &&
        this.shared.getTargetMood() !== null
      ) {
        console.log("if: " + this.shared.getCurrentMood());
        navCtrl.navigateRoot('/moodify/home');
      }
      else {
        console.log("else: " + this.shared.getCurrentMood());
        navCtrl.navigateRoot('/mood');
      }
    }
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_code = data.country_code;
    });
    if (this.params.access_token !== undefined) {
      window.history.replaceState({}, document.title, '/' + 'login');
    }
  }

  onClickLogin() {
    window.location.href = 'http://localhost:8888/login';
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
