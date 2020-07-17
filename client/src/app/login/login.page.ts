import { UserProfile } from './../interfaces/UserProfile';
import { EmojisService } from './../services/emojis.service';
import { Triple } from './../classes/Triple';
import { MachineLearningService } from '../services/machineLearning.service';
import { UserPreferences } from './../interfaces/UserPreferences';
import { PreferencesServices } from './../services/preferences.service';
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

  // User profile
  userProfile: UserProfile;

  // Handler
  end = false;
  _checkDB: any;

  constructor(private shared: SharedParamsService, private prefService: PreferencesServices,
    private navCtrl: NavController, private loadingCtrl: LoadingController, private emoji: EmojisService,
    private learningService: MachineLearningService) {
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

  // this function call the login server
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
    this.presentLoading('Loading datas ...').then(() => {
      this.spotifyApi.getMe().then((response) => {
        this.userProfile = {
          ID: response.id,
          country: response.country,
          targetFeatures: undefined,
          url: response.external_urls.spotify,
          email: response.email,
          profilePhoto: undefined ? 'assets/img/noImgAvailable.png' : response.images[0].url,
          name: response.display_name,
          preferences: undefined
        }
      }).then(() => {
        this.prefService.getUserPreferences(this.userProfile.ID).then(result => {
          if (result !== undefined) {
            const userPreferences: UserPreferences = {
              favoriteGenres: result.favoriteGenres,
              hatedGenres: result.hatedGenres,
              favoriteSingers: result.favoriteSingers
            }
            this.userProfile.preferences = userPreferences;
          }
        }).then(() => {
          this.learningService.getUser(this.userProfile.ID).then(result2 => {
            if (result2 !== undefined) {
              if (this.shared.getCurrentMood() !== undefined && this.shared.getTargetMood() !== undefined) {
                this.learningService.getUserData(this.userProfile.ID, this.shared.getCurrentMood(), this.shared.getTargetMood())
                  .then(result3 => {
                    this.userProfile.targetFeatures = result3;
                  }).then(() => {
                    this.shared.setUserProfile(this.userProfile);
                    this.loadingCtrl.dismiss();
                    this.checkSettedMood();
                  });
              }
              else {
                this.loadingCtrl.dismiss();
              }
            }
            else {
              this.copyModel();
              this.checkDB();
            }
          });
        });
      });
    });
  }

  // this function redirect page if moods were already setted
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

  // This function initialize the redirection page to the login
  // besed if is localhost or web
  initializeHref() {
    if (window.location.href.includes('localhost')) {
      this.href = 'http://localhost:8888/login';
    }
    else {
      this.href = 'https://moodify-spotify-server.herokuapp.com/login';
    }
  }

  // This function let user to use a different account
  changeAccount() {
    const url = 'https://www.spotify.com/logout/'
    const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')
    setTimeout(() => spotifyLogoutWindow.close(), 2000)
  }

  // Loading data
  async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }

  copyModel() {
    const arrayEmoji = this.emoji.getArrayEmoji();
    for (const [index, emoji] of arrayEmoji.entries()) {
      for (const [index2, emoji2] of arrayEmoji.entries()) {
        const arrayTrip: Array<Triple> = [];
        let tempResult;
        this.learningService.getModelData(emoji.name, emoji2.name).then(result => {
          if (result !== undefined) {
            if (emoji.name === this.shared.getCurrentMood() && emoji2.name === this.shared.getTargetMood()) {
              this.userProfile.targetFeatures = result;
            }
            tempResult = result;
          }
        }).then(() => {
          if (tempResult !== undefined) {
            const triple = new Triple();
            triple.mood = emoji2.name;
            triple.numFeedback = 1;
            triple.spotifyFeatures = tempResult;
            arrayTrip.push(triple);
            this.learningService.uploadPersonal(arrayTrip, this.userProfile.ID, emoji.name);
          }
        }).then(() => {
          if (index * index2 === Math.pow(arrayEmoji.length - 1, 2)) {
            this.end = true;
          }
        });
      }
    }
  }

  // this function checks every second if the model has been copied
  // to the new user account
  async checkDB() {
    this._checkDB = setInterval(() => {
      if (this.end === true) {
        clearInterval(this._checkDB);
        this.shared.setUserProfile(this.userProfile);
        this.loadingCtrl.dismiss();
        this.checkSettedMood();
      }
    }, 1000);
  }
}
