import { UploadJSONService } from './../services/upload-json.service';
import { TrackDatas } from './../interfaces/TrackDatas';
import { LogoutService } from './../services/logout.service';
import { EmojisService } from './../services/emojis.service';
import { Tripla } from '../classes/tripla';
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

  // triple used for the reinforcement learning
  arrayTriple: Array<Tripla> = [];
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
  firstListen = true
  idUser = '';
  _dataHandler: any;
  currentDay: string
  userExist = false;

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
    private jsonService: UploadJSONService, private loadingCtrl: LoadingController) {
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
      this.getUserId().then(id => {
        this.idUser = id;
        this.currentDay = new Date().getDay() + '-' + new Date().getMonth() + '-' + new Date().getFullYear();
        this.jsonService.getUserSession(this.idUser, this.currentDay, this.shared.getCurrentMood(), this.shared.getTargetMood())
          .then(result => {
            if (result !== undefined) {
              for (const values of result.triples) {
                const triple = new Tripla();
                triple.setPreviusMood(values.previusMood);
                triple.setCurrentSpotifyData(values.spotifyDataCurrent);
                triple.setPreviousSpotifyData(values.spotifyDataPrevious);
                this.arrayTriple.push(triple);
                this.feedback = triple.previusMood;
              }
              this.userExist = true;
              this.firstListen = false;
            }
            this.loadingCtrl.dismiss();
          });
      });
    });
  }

  // Asyncronous function to get userID from spotify
  async getUserId() {
    const response = await this.spotifyApi.getMe();
    const url = await response.id;
    return (url.substring(url.lastIndexOf('/') + 1, url.length));
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
      this.realizeTable();
    }).catch(err => {
      console.log(err);
    });
  }

  // this function is used to set Triple for the table
  realizeTable() {
    const triple = new Tripla();
    triple.setPreviusMood(this.feedback);

    let prevSpotifyFeature: TrackDatas;
    if (this.arrayTriple.length > 0) {
      prevSpotifyFeature = this.arrayTriple[this.arrayTriple.length - 1].getCurrentSpotifyData();
      triple.setPreviousSpotifyData(prevSpotifyFeature);
    }
    this.spotifyApi.getAudioFeaturesForTrack(this.currentMusicplaying.idTrack).then((response) => {
      const currentSpotifyFeature: TrackDatas = {
        id: this.currentMusicplaying.idTrack,
        duration_ms: response.duration_ms,
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
      triple.setCurrentSpotifyData(currentSpotifyFeature);
      if (this.firstListen && this.arrayTriple.length > 0) {
        this.arrayTriple.pop();
        this.firstListen = false;
      }
      this.arrayTriple.push(triple);
    }).catch(err => {
      console.log(err);
    });
  }

  // upload json to firebase
  onClickEndSession() {
    const trainingJSON: JsonData = {
      triples: this.arrayTriple.map((obj) => { return Object.assign({}, obj) })
    }
    if (this.userExist) {
      this.jsonService.updateSession(trainingJSON, this.idUser, this.currentDay, this.shared.getCurrentMood(), this.shared.getTargetMood());
    }
    else {
      this.jsonService.uploadSession(trainingJSON, this.idUser, this.currentDay, this.shared.getCurrentMood(), this.shared.getTargetMood());
    }
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
      cssClass: 'alertClassDanger',
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
      cssClass: 'alertClassDanger',
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
            this.arrayTriple.pop();
            this.waitNewFeedback = false;
            this.onGivenFeedback(feedback);
            this.realizeTable();
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
