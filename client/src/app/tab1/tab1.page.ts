import { TrackDatas } from './../interfaces/TrackDatas';
import { ManumissionCheckService } from './../services/manumission-check.service';
import { UserProfile } from './../interfaces/UserProfile';
import { MachineLearningService } from '../services/machineLearning.service';
import { TrackFeatures } from '../interfaces/TrackFeatures';
import { LogoutService } from './../services/logout.service';
import { EmojisService } from './../services/emojis.service';
import { Double } from '../classes/Double';
import { AlertController, LoadingController } from '@ionic/angular';
import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {

  // spotifyApi
  spotifyApi = new SpotifyWebApi();

  // search variables
  searchTrack: Array<{ key: string, image: any, name: string }> = [];

  // pair used for the reinforcement learning
  doubleToUpload: Double = new Double();
  currentMusicplaying: TrackDatas = null;
  idUser = '';
  userInDB = { exist: true, checked: true };

  // features desired
  desiredFeature: TrackFeatures;

  // emojis
  arrayEmoji: Array<{ name: string, image: string }> = [];
  divEmoji = false;
  feedbackEmoji = true;
  waitNewFeedback = false;
  feedback: string;

  // Player variables
  soundPlayer = new Audio();
  currentPreview: any = undefined;
  currentPlaying: any = undefined;
  spotifyWindow: Window;
  _previewIntervalHandler: any;
  _playIntervalHandler: any;

  constructor(private shared: SharedParamsService, private logoutService: LogoutService,
    private alertController: AlertController, private emoji: EmojisService,
    private learningService: MachineLearningService, private loadingCtrl: LoadingController,
    private manumission: ManumissionCheckService) {
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.setAccessToken(this.shared.getToken());
        this.arrayEmoji = this.emoji.getArrayEmoji();
        if (this.shared.getTargetMood() !== null) {
          this.initializeSessionDB();
        }
      }
    }
  }

  // Initialize user's session from DB if it exist
  initializeSessionDB() {
    this.presentLoading('Loading datas ...').then(() => {
      const userProfile: UserProfile = this.shared.getUserProfile();
      this.idUser = userProfile.ID;
      this.learningService.getUserData(this.idUser, this.shared.getCurrentMood(), this.shared.getTargetMood())
        .then(result => {
          if (result !== undefined) {
            this.desiredFeature = result.features;
            this.userInDB = {
              exist: true,
              checked: true
            }
            console.log('Desired Features: ', this.desiredFeature);
          }
          else {
            console.log('Nessun utente trovato');
            this.userInDB = {
              exist: false,
              checked: true
            }
          }
          this.loadingCtrl.dismiss();
        });
    });
  }

  // this function let user searching an artist
  searchMusic($event) {
    this.divEmoji = false;
    if (this.searchTrack.length > 0) {
      this.searchTrack = [];
    }
    if (this.currentMusicplaying !== null) {
      this.currentMusicplaying = null;
    }
    if ($event.detail.value.length > 0) {
      let dataSearch: { key: string, image: any, name: string };
      if (!this.manumission.isTampered()) {
        if (this.shared.checkExpirationToken()) {
          this.alertTokenExpired();
        }
        else {
          this.spotifyApi.search($event.detail.value, ['track'], { /*market: this.country_code,*/ limit: 5, offset: 0 })
            .then((response) => {
              if (response !== undefined) {
                for (const trackItem of response.tracks.items) {
                  if (trackItem.album.images.length !== 0) {
                    dataSearch = {
                      key: trackItem.id,
                      image: trackItem.album.images[1].url,
                      name: trackItem.name,
                    };
                  }
                  else {
                    dataSearch = {
                      key: trackItem.id,
                      image: 'assets/img/noImgAvailable.png',
                      name: trackItem.name,
                    };
                  }
                  this.searchTrack.push(dataSearch);
                }
              }
            }).catch(err => {
              console.log(err);
            });
        }
      }
    }
  }

  // This function clear search input
  clearInput() {
    if (this.searchTrack.length > 0) {
      this.searchTrack = [];
    }
  }

  // This function uses spotify API to get a specific track and load its information
  onClickTrack(idTrack: string) {
    this.divEmoji = true;
    this.waitNewFeedback = false;
    this.stop(null);
    if (this.searchTrack.length > 0) {
      this.searchTrack = [];
    }
    let popularity;
    this.presentLoading('Loading datas ...').then(() => {
      this.spotifyApi.getTrack(idTrack).then((response) => {
        if (response !== undefined) {
          if (response.album.images[0].url !== undefined) {
            this.currentMusicplaying = {
              uriID: response.uri,
              idTrack,
              nomi_artisti: response.artists,
              image: response.album.images[1].url,
              currentlyPlayingPreview: false,
              currentlyPlayingSong: false,
              duration: response.duration_ms,
              nome_album: response.name,
              preview_url: response.preview_url,
              external_urls: response.external_urls.spotify,
              features: undefined
            };
          }
          else {
            this.currentMusicplaying = {
              uriID: response.uri,
              idTrack,
              nomi_artisti: response.artists,
              image: 'assets/img/noImgAvailable.png',
              currentlyPlayingPreview: false,
              currentlyPlayingSong: false,
              duration: response.duration_ms,
              nome_album: response.name,
              preview_url: response.preview_url,
              external_urls: response.external_urls.spotify,
              features: undefined
            };
          }
          popularity = response.popularity;
        }
        this.feedbackEmoji = false;
        this.divEmoji = true;
      }).then(() => {
        this.spotifyApi.getAudioFeaturesForTrack(this.currentMusicplaying.idTrack).then((response2) => {
          if (response2 !== undefined) {
            this.currentMusicplaying.features = {
              key: response2.key,
              mode: response2.mode,
              time_signature: response2.time_signature,
              acousticness: response2.acousticness,
              danceability: response2.danceability,
              energy: response2.energy,
              instrumentalness: response2.instrumentalness,
              liveness: response2.liveness,
              loudness: response2.loudness,
              speechiness: response2.speechiness,
              valence: response2.valence,
              tempo: response2.tempo,
              popularity
            }
          }
        }).then(() => {
          this.loadingCtrl.dismiss();
        }).catch(err => {
          console.log(err);
        });
      }).catch(err => {
        console.log(err);
      });
    });
  }

  // this function is used to initialize double to upload to the DB
  uploadFeedbackToDB() {
    this.doubleToUpload.mood = this.feedback;
    this.doubleToUpload.spotifyFeatures = this.currentMusicplaying.features;
    if (!this.manumission.isTampered()) {
      this.learningService.trainModel(this.doubleToUpload, this.shared.getCurrentMood());
      this.learningService.uploadPersonal(this.doubleToUpload, this.idUser, this.shared.getCurrentMood(), false);
    }
  }

  // this function is used to get emotion feedback double
  onGivenFeedback(feedback: string) {
    console.log(this.currentMusicplaying.features);

    const data = this.arrayEmoji.find(currentEmotion => currentEmotion.name === feedback);
    if (this.feedbackEmoji && this.waitNewFeedback) {
      const image = document.querySelector('#current' + this.arrayEmoji.indexOf(data)) as HTMLElement;
      if (image.style.filter !== 'none') {
        this.alertChangeFeedback(feedback);
      }
    }
    else {
      let image: any;
      for (let i = 0; i < this.arrayEmoji.length; i++) {
        image = document.querySelector('#current' + i) as HTMLElement;
        if (i !== this.arrayEmoji.indexOf(data)) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
      this.feedbackEmoji = true;
      this.waitNewFeedback = true;
      this.feedback = feedback;
      this.uploadFeedbackToDB();
    }
  }

  // this function open spotify browser and play the selected song/music
  // tslint:disable-next-line: variable-name
  openSpotifyPlayer(external_urls: string) {
    if (this.currentPlaying !== undefined) {
      this.currentMusicplaying.currentlyPlayingSong = false;
      this.currentPlaying = undefined;
    }
    if (this.currentPreview !== undefined) {
      this.stop(this.currentPreview.uriID);
    }
    if (this.currentMusicplaying !== undefined || this.currentMusicplaying !== null) {
      this.currentPlaying = this.currentMusicplaying;
      if (this.currentMusicplaying.external_urls !== null) {
        this.currentMusicplaying.currentlyPlayingSong = true;
        this.spotifyWindow = window.open(external_urls, '_blank');
        this.clearInput();
        this.checkWindowClosed(this.currentMusicplaying);
      } setTimeout(() => {
        this.currentPlaying = undefined;
        this.currentMusicplaying.currentlyPlayingSong = false;
      }, this.currentMusicplaying.duration);
    }
  }

  // this function checks every second if the opened window
  // of spotify music/song is closed and is used for removing
  // the play button image over the album image
  async checkWindowClosed(data: any) {
    this._playIntervalHandler = setInterval(() => {
      if (this.spotifyWindow !== undefined) {
        if (this.spotifyWindow.closed && data !== undefined) {
          this.currentMusicplaying.currentlyPlayingSong = false;
          clearInterval(this._playIntervalHandler);
        }
      }
    }, 1000);
  }

  // this function play the preview of the song if it is available
  playPreview(uri: string) {
    // if current playing
    if (this.soundPlayer.currentTime > 0) {
      this.stop(this.currentPreview.uriID);
    }
    if (this.currentMusicplaying !== undefined) {
      if (this.currentMusicplaying.preview_url !== null) {
        this.currentMusicplaying.currentlyPlayingPreview = true;
        this.soundPlayer.src = this.currentMusicplaying.preview_url;
        this.soundPlayer.play();
        this.progressBar();
      } setTimeout(() => {
        this.soundPlayer.pause();
        this.soundPlayer.currentTime = 0;
        this.currentMusicplaying = undefined;
        if (this.currentMusicplaying !== undefined) {
          this.currentMusicplaying.currentlyPlayingPreview = false;
        }
      }, 30000);
    }
  }

  // this function is used in combination with "playPreview" function
  // only for visual scope
  async progressBar() {
    this._previewIntervalHandler = setInterval(() => {
    }, 100);
  }

  // this function stop a preview music/song if it is in playing
  stop(uri: string) {
    this.soundPlayer.pause();
    clearInterval(this._previewIntervalHandler);
    this.soundPlayer.currentTime = 0;
    this.currentPreview = undefined;
    this.currentPlaying = undefined;
    if (uri !== null) {
      if (this.currentMusicplaying !== undefined) {
        this.currentMusicplaying.currentlyPlayingPreview = false;
      }
    }
  }

  // Logout form the website
  logout() {
    this.logoutService.logout();
  }

  /** ALERTS */
  /* ALERT NO PREVIEW BUTTON */
  async noPreview() {
    const alert = await this.alertController.create({
      header: 'Error',
      cssClass: 'alertClassError',
      message: 'No preview is available for this song',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();
  }

  /* ALERT CHECK EXPIRATION TOKEN */
  async alertTokenExpired() {
    const alert = await this.alertController.create({
      header: 'Error',
      cssClass: 'alertClassError',
      message: 'Your token is expired. Click ok to refresh it!',
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

  /* ALERT USER CHANGE HIS/HER FEEDBACK FOR A SONG */
  async alertChangeFeedback(feedback: string) {
    const alert = await this.alertController.create({
      header: 'Change Feedback',
      cssClass: 'alertClassWarning',
      message: 'Do you want to change the previous feedback?',
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertMedium',
          handler: () => {
            this.learningService.uploadPersonal(this.doubleToUpload, this.idUser, this.shared.getCurrentMood(), true);
            this.waitNewFeedback = false;
            this.onGivenFeedback(feedback);
          }
        },
        {
          text: 'No',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();
  }

  // Round features to 3rd decimal number
  roundTo(value, places) {
    const power = Math.pow(10, places);
    return Math.round(value * power) / power;
  }

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

  // Loading data
  async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }
}
