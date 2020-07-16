import { ManumissionCheckService } from './../services/manumission-check.service';
import { UserProfile } from './../interfaces/UserProfile';
import { UploadJSONService } from './../services/upload-json.service';
import { TrackDatas } from './../interfaces/TrackDatas';
import { LogoutService } from './../services/logout.service';
import { EmojisService } from './../services/emojis.service';
import { Triple } from '../classes/Triple';
import { AlertController, LoadingController } from '@ionic/angular';
import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { JsonData } from '../interfaces/JsonData';

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
  mapFeatureEmotion: Array<Triple> = [];
  currentMusicplaying: {
    uriID: string,
    idTrack: string,
    nomi_artisti: any[],
    image: any,
    currentlyPlayingPreview: boolean,
    currentlyPlayingSong: boolean,
    duration: number,
    nome_album: string,
    preview_url: string,
    external_urls: string
  } = null;
  idUser = '';
  _dataHandler: any;
  userInDB = { exist: true, checked: true };

  // features desired
  desiredFeature: TrackDatas;

  // emojis
  arrayEmoji: Array<{ name: string, image: string }> = [];
  divEmoji = false;
  feedbackEmoji = true;
  waitNewFeedback = false;
  feedback: string;
  numFeedback = 0;

  // Player variables
  soundPlayer = new Audio();
  currentPreview: any = undefined;
  currentPlaying: any = undefined;
  spotifyWindow: Window;
  _previewIntervalHandler: any;
  _playIntervalHandler: any;

  constructor(private shared: SharedParamsService, private logoutService: LogoutService,
    private alertController: AlertController, private emoji: EmojisService,
    private jsonService: UploadJSONService, private loadingCtrl: LoadingController,
    private manumission: ManumissionCheckService) {
    this.manumission.checkManumission();
    if (this.shared.checkExpirationToken()) {
      this.alertTokenExpired();
    }
    else {
      this.spotifyApi.setAccessToken(this.shared.getToken());
      this.arrayEmoji = this.emoji.getArrayEmoji();
      this.initializeSessionDB();
    }
  }

  // Initialize user's session from DB if it exist
  initializeSessionDB() {
    this.presentLoading('Loading datas ...').then(() => {
      const userProfile: UserProfile = this.shared.getUserProfile();
      this.idUser = userProfile.ID;
      this.jsonService.getUserData(this.idUser, this.shared.getCurrentMood(), this.shared.getTargetMood())
        .then(result => {
          if (result !== undefined) {
            this.desiredFeature = result;
            this.userInDB = {
              exist: true,
              checked: true
            }
            console.log(this.desiredFeature);

          }
          else {
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
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.search($event.detail.value, ['track'], { /*market: this.country_code,*/ limit: 5, offset: 0 }).then((response) => {
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
            external_urls: response.external_urls.spotify
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
            external_urls: response.external_urls.spotify
          };
        }
      }
      this.feedbackEmoji = false;
      this.divEmoji = true;
    }).catch(err => {
      console.log(err);
    });
  }

  // this function is used to set Triple for the table
  realizeTable() {
    const triple = new Triple();
    this.spotifyApi.getAudioFeaturesForTrack(this.currentMusicplaying.idTrack).then((response) => {
      let SpotifyFeature: TrackDatas = {
        key: response.key,
        mode: response.mode,
        time_signature: response.time_signature,
        acousticness: response.acousticness,
        danceability: response.danceability,
        energy: response.energy,
        instrumentalness: response.instrumentalness,
        liveness: response.liveness,
        loudness: response.loudness,
        speechiness: response.speechiness,
        valence: response.valence,
        tempo: response.tempo,
      }
      let found = false;
      for (const item of this.mapFeatureEmotion) {
        if (item.getMood() === this.feedback) {
          const previous: TrackDatas = item.getSpotifyFeatures();
          SpotifyFeature = {
            key: (SpotifyFeature.key + previous.key),
            mode: (SpotifyFeature.mode + previous.mode),
            time_signature: (SpotifyFeature.time_signature + previous.time_signature),
            acousticness: (SpotifyFeature.acousticness + previous.acousticness),
            danceability: (SpotifyFeature.danceability + previous.danceability),
            energy: (SpotifyFeature.energy + previous.energy),
            instrumentalness: (SpotifyFeature.instrumentalness + previous.instrumentalness),
            liveness: (SpotifyFeature.liveness + previous.liveness),
            loudness: (SpotifyFeature.loudness + previous.loudness),
            speechiness: (SpotifyFeature.speechiness + previous.speechiness),
            valence: (SpotifyFeature.valence + previous.valence),
            tempo: (SpotifyFeature.tempo + previous.tempo),
          }
          item.spotifyFeatures = SpotifyFeature;
          item.numFeedback++;
          found = true;
          break;
        }
      }
      if (!found) {
        triple.mood = this.feedback;
        triple.spotifyFeatures = SpotifyFeature;
        triple.numFeedback = 1;
        this.mapFeatureEmotion.push(triple);
      }
      console.log(this.mapFeatureEmotion);
    }).catch(err => {
      console.log(err);
    });
  }

  // train model to firebase
  onClickEndSession() {
    for (const item of this.mapFeatureEmotion) {
      if (item.numFeedback > 1) {
        let features: TrackDatas = item.getSpotifyFeatures();
        features = {
          key: Math.round(features.key / item.numFeedback),
          mode: Math.round(features.mode / item.numFeedback),
          time_signature: Math.round(features.time_signature / item.numFeedback),
          acousticness: (features.acousticness / item.numFeedback),
          danceability: (features.danceability / item.numFeedback),
          energy: (features.energy / item.numFeedback),
          instrumentalness: (features.instrumentalness / item.numFeedback),
          liveness: (features.liveness / item.numFeedback),
          loudness: (features.loudness / item.numFeedback),
          speechiness: (features.speechiness / item.numFeedback),
          valence: (features.valence / item.numFeedback),
          tempo: (features.tempo / item.numFeedback),
        }
        item.spotifyFeatures = features;
        item.numFeedback = 1;
      }
    }
    this.jsonService.trainModel(this.mapFeatureEmotion, this.idUser, this.shared.getCurrentMood());
  }

  // this function is used to get emotion feedback triple
  onGivenFeedback(feedback: string) {
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
      this.numFeedback++;
      this.realizeTable();
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
