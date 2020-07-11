import { UserPreferences } from './../interfaces/UserPreferences';
import { PreferencesServices } from './../services/preferences.service';
import { UserProfile } from './../interfaces/UserProfile';
import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import SpotifyWebApi from 'spotify-web-api-js';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {

  // spotifyAPI
  spotifyApi = new SpotifyWebApi();

  params: any;
  href: string;

  constructor(private shared: SharedParamsService, private prefService: PreferencesServices,
    private navCtrl: NavController, private loadingCtrl: LoadingController) {
    this.params = this.getHashParams();
    // if already logged
    if (this.shared.getExpirationToken() !== null && this.params.access_token === undefined) {
      if (this.shared.checkExpirationToken()) {
        this.initializeHref();
        this.onClickLogin();
      }
      else {
        this.initializeSessionDB();
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
        this.initializeSessionDB();
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
    const hashParams = {};
    const r = /([^&;=]+)=?([^&;]*)/g;
    const q = window.location.hash.substring(1);
    let e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  // Initialize user's session from DB if it exist
  initializeSessionDB() {
    this.spotifyApi.setAccessToken(this.shared.getToken());
    let userProfile: UserProfile;
    this.presentLoading('Loading datas ...').then(() => {
      this.spotifyApi.getMe().then((response) => {
        userProfile = {
          ID: response.id,
          country: response.country,
          url: response.external_urls.spotify,
          email: response.email,
          profilePhoto: undefined ? 'assets/img/noImgAvailable.png' : response.images[0].url,
          name: response.display_name,
          preferences: undefined
        }
      }).then(() => {
        this.prefService.getUserPreferences(userProfile.ID).then(result => {
          if (result !== undefined) {
            const userPreferences: UserPreferences = {
              favoriteGenres: result.favoriteGenres,
              hatedGenres: result.hatedGenres,
              favoriteSingers: result.favoriteSingers
            }
            userProfile = {
              ID: userProfile.ID,
              country: userProfile.country,
              url: userProfile.url,
              email: userProfile.email,
              profilePhoto: userProfile.profilePhoto,
              name: userProfile.name,
              preferences: userPreferences
            }
          }
        }).then(() => {
          this.shared.setUserProfile(userProfile);
          this.loadingCtrl.dismiss();
          this.checkSettedMood();
        });
      });
    });
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

  changeAccount() {
    const url = 'https://www.spotify.com/logout/'
    const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')
    setTimeout(() => spotifyLogoutWindow.close(), 2000)
  }

  async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }
}
