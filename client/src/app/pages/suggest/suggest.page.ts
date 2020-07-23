import { EmojiFeedback } from './../../interfaces/EmojiFeedback';
import { RecommendationParameterService } from '../../services/recommendation-parameter.service';
import { TrackData } from './../../interfaces/TrackData';
import { ManumissionCheckService } from './../../services/manumission-check.service';
import { UserProfile } from './../../interfaces/UserProfile';
import { MachineLearningService } from './../../services/machineLearning.service';
import { LogoutService } from './../../services/logout.service';
import { EmojisService } from './../../services/emojis.service';
import { Double } from '../../classes/Double';
import { AlertController, LoadingController } from '@ionic/angular';
import { SharedParamsService } from './../../services/shared-params.service';
import { Component } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

@Component({
  selector: 'app-suggest',
  templateUrl: 'suggest.page.html',
  styleUrls: ['suggest.page.scss'],
})
export class SuggestPage {

  // spotifyApi
  spotifyApi = new SpotifyWebApi();

  // search suggested music array
  recommendationTrack: Array<{ key: string, image: any, name: string }> = [];
  currentIndexPlaying = 0;
  listOfListened: string[] = [];

  // features desired
  desiredFeature: any;

  // pair used for the reinforcement learning
  doubleToUpload: Double = new Double();
  currentMusicplaying: TrackData = null;
  userInDB = { exist: true, checked: true };
  userProfile: UserProfile;
  bufferLimit: number;
  wrongFeedback = 0;

  // emojis
  divEmoji = false;
  feedback: string;
  feedbackPerTrack: Array<{ feedback: string, feedbackEmoji: boolean, waitNewFeedback: boolean, arrayEmoji: Array<EmojiFeedback> }> = []

  // Player variables
  soundPlayer = new Audio();
  currentPreview: any = undefined;
  currentPlaying: any = undefined;
  spotifyWindow: Window;
  _previewIntervalHandler: any;
  _previewTimeOut: any;
  _playIntervalHandler: any;

  constructor(private shared: SharedParamsService, private logoutService: LogoutService,
    private alertController: AlertController, private emoji: EmojisService,
    private learningService: MachineLearningService, private loadingCtrl: LoadingController,
    private manumission: ManumissionCheckService, private recommendation: RecommendationParameterService) {
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.setAccessToken(this.shared.getToken());
      }
    }
  }

  ionViewDidLeave() {
    this.stop(null);
  }

  // Initialize user's session from DB if it exist
  initializeSessionDB() {
    this.presentLoading('Loading data ...').then(() => {
      this.userProfile = this.shared.getUserProfile();
      let tempDesiredFeature: any;
      this.learningService.getUserData(this.userProfile.ID, this.shared.getCurrentMood(), this.shared.getTargetMood())
        .then(result => {
          if (result !== undefined) {
            this.userInDB = {
              exist: true,
              checked: true
            }
            this.bufferLimit = result.buff.numFeed;
            tempDesiredFeature = {
              limit: 100,
              target_acousticness: result.features.acousticness,
              target_key: result.features.key,
              target_mode: result.features.mode,
              target_time_signature: result.features.time_signature,
              target_danceability: result.features.danceability,
              target_energy: result.features.energy,
              target_instrumentalness: result.features.instrumentalness,
              target_liveness: result.features.liveness,
              target_loudness: result.features.loudness,
              target_speechiness: result.features.speechiness,
              target_valence: result.features.valence,
              target_tempo: result.features.tempo,
              target_popularity: result.features.popularity,
            }
            let pref1: { seed_artists: string[], seed_genres: string[] };
            let pref2;
            if (this.userProfile.preferences !== undefined) {
              pref1 = this.recommendation.getRecommendation(this.userProfile);
              if (pref1 === undefined) {
                this.recommendation.autoSearchFavGenres(this.userProfile).then(res => {
                  pref2 = res;
                  if (pref2 !== undefined) {
                    tempDesiredFeature.seed_genres = pref2;
                  }
                }).then(() => {
                  if (pref2 === undefined) {
                    this.recommendation.generateRandomGenresSeed(this.userProfile).then(res2 => {
                      pref2 = res2;
                      if (pref2 !== undefined) {
                        tempDesiredFeature.seed_genres = pref2;
                      }
                    });
                  }
                  this.loadingCtrl.dismiss();
                  this.desiredFeature = tempDesiredFeature;
                  this.recommendMusic();
                });
              }
              else {
                if (pref1.seed_artists.length > 0) {
                  tempDesiredFeature.seed_artists = pref1.seed_artists;
                }
                if (pref1.seed_genres.length > 0) {
                  tempDesiredFeature.seed_genres = pref1.seed_genres;
                }
                this.loadingCtrl.dismiss();
                this.desiredFeature = tempDesiredFeature;
                this.recommendMusic();
              }
            }
            else {
              this.recommendation.generateRandomGenresSeed(this.userProfile).then(res3 => {
                pref2 = res3;
                if (pref2 !== undefined) {
                  tempDesiredFeature.seed_genres = pref2;
                }
                this.loadingCtrl.dismiss();
                this.desiredFeature = tempDesiredFeature;
                this.recommendMusic();
              });
            }
          }
          else {
            this.userInDB = {
              exist: false,
              checked: true
            }
            this.loadingCtrl.dismiss();
            this.desiredFeature = tempDesiredFeature;
            this.recommendMusic();
          }
        });
    });
  }

  ionViewWillEnter() {
    // remove from line 164 to 169 (remove the alert) when the model is ready
    const i = false;
    if (!i) {
      this.alertNotAvailable();
    }
    else {
      if (this.shared.getTargetMood() !== null) {
        this.initializeSessionDB();
      }
    }
  }

  // this function search for a music based on user suggested features
  // and seeds (genres and/or favorite artist)
  recommendMusic() {
    this.divEmoji = false;
    this.stop(null);
    this.recommendationTrack = [];
    this.feedbackPerTrack = [];
    if (this.currentMusicplaying !== null) {
      this.currentMusicplaying = null;
    }
    let dataSearch: { key: string, image: any, name: string };
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        const arrayEmoji = this.emoji.getArrayEmoji();
        console.log(this.desiredFeature);
        this.spotifyApi.getRecommendations(this.desiredFeature)
          .then((response) => {
            if (response !== undefined) {
              for (const trackItem of response.tracks) {
                if (trackItem['album'].images.length !== 0) {
                  dataSearch = {
                    key: trackItem.id,
                    image: trackItem['album'].images[1].url,
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
                const initFeedArray: {
                  feedback: string, feedbackEmoji: boolean,
                  waitNewFeedback: boolean, arrayEmoji: Array<EmojiFeedback>
                } = {
                  arrayEmoji,
                  feedbackEmoji: true,
                  waitNewFeedback: false,
                  feedback: undefined
                }
                if (this.listOfListened.length > 0) {
                  let found = false;
                  for (const item of this.listOfListened) {
                    if (item === dataSearch.key) {
                      found = true;
                      break;
                    }
                  }
                  if (!found) {
                    this.recommendationTrack.push(dataSearch);
                    this.feedbackPerTrack.push(initFeedArray);
                  }
                }
                else {
                  this.recommendationTrack.push(dataSearch);
                  this.feedbackPerTrack.push(initFeedArray);
                }
              }
              if (this.recommendationTrack.length > 0) {
                this.onClickTrack(this.currentIndexPlaying);
              }
              else {
                this.listOfListened = [];
                this.initializeSessionDB();
              }
            }
          }).catch(err => {
            console.log(err);
          });
      }
    }
  }

  // This function uses spotify API to get a specific track and load its information
  onClickTrack(indexOfTrack: number) {
    this.stop(null);
    this.currentIndexPlaying = indexOfTrack;
    const idTrack = this.recommendationTrack[indexOfTrack].key;
    this.divEmoji = true;
    let popularity;
    let image: any;
    if (this.feedbackPerTrack[indexOfTrack].feedback !== undefined) {
      const data = this.feedbackPerTrack[indexOfTrack].arrayEmoji
        .find(currentEmotion => currentEmotion.name === this.feedbackPerTrack[indexOfTrack].feedback);
      for (let i = 0; i < this.feedbackPerTrack[indexOfTrack].arrayEmoji.length; i++) {
        image = document.querySelector('#current' + i) as HTMLElement;
        if (i !== this.feedbackPerTrack[indexOfTrack].arrayEmoji.indexOf(data)) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
    }
    else {
      for (let i = 0; i < this.feedbackPerTrack[indexOfTrack].arrayEmoji.length; i++) {
        image = document.querySelector('#current' + i) as HTMLElement;
        if (image !== null) {
          image.style.filter = 'none';
        }
      }
    }
    this.presentLoading('Loading data ...').then(() => {
      this.spotifyApi.getTrack(idTrack).then((response) => {
        if (response !== undefined) {
          this.currentMusicplaying = {
            uriID: response.uri,
            idTrack,
            artists_name: response.artists,
            image: undefined,
            currentlyPlayingPreview: false,
            currentlyPlayingSong: false,
            duration: response.duration_ms,
            album_name: response.name,
            preview_url: response.preview_url,
            external_urls: response.external_urls.spotify,
            features: undefined
          };
          if (response.album.images[0].url !== undefined) {
            this.currentMusicplaying.image = response.album.images[1].url;
          }
          else {
            this.currentMusicplaying.image = 'assets/img/noImgAvailable.png';
          }
          popularity = response.popularity;
        }
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
      this.learningService.uploadPersonal(this.doubleToUpload, this.userProfile.ID, this.shared.getCurrentMood(), false);
      if (this.doubleToUpload.mood === this.shared.getTargetMood()) {
        if (this.bufferLimit++ === 5) {
          this.bufferLimit = 1;
          this.currentIndexPlaying = 0;
          this.initializeSessionDB();
          this.wrongFeedback = 0;
        }
      }
      else {
        if (++this.wrongFeedback > 10) {
          this.alertRecommendation();
        }
      }
    }
  }

  // this function is used to get emotion feedback double
  onGivenFeedback(feedback: string) {
    const data = this.feedbackPerTrack[this.currentIndexPlaying].arrayEmoji
      .find(currentEmotion => currentEmotion.name === feedback);
    if (this.feedbackPerTrack[this.currentIndexPlaying].feedbackEmoji &&
      this.feedbackPerTrack[this.currentIndexPlaying].waitNewFeedback) {
      const image = document.querySelector('#current' +
        this.feedbackPerTrack[this.currentIndexPlaying].arrayEmoji.indexOf(data)) as HTMLElement;
      if (image.style.filter !== 'none') {
        this.alertChangeFeedback(feedback);
      }
    }
    else {
      let image: any;
      for (let i = 0; i < this.feedbackPerTrack[this.currentIndexPlaying].arrayEmoji.length; i++) {
        image = document.querySelector('#s_current' + i) as HTMLElement;
        if (i !== this.feedbackPerTrack[this.currentIndexPlaying].arrayEmoji.indexOf(data)) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
      this.feedbackPerTrack[this.currentIndexPlaying].waitNewFeedback = true;
      this.feedback = feedback;
      this.feedbackPerTrack[this.currentIndexPlaying].feedbackEmoji = true;
      this.feedbackPerTrack[this.currentIndexPlaying].feedback = feedback;
      this.listOfListened.push(this.currentMusicplaying.idTrack);
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
      this.stop(uri);
    }
    if (this.currentMusicplaying !== undefined) {
      if (this.currentMusicplaying.preview_url !== null) {
        this.currentMusicplaying.currentlyPlayingPreview = true;
        this.soundPlayer.src = this.currentMusicplaying.preview_url;
        this.soundPlayer.play();
        this.progressBar();
      }
      this._previewTimeOut = setTimeout(() => {
        this.soundPlayer.pause();
        this.soundPlayer.currentTime = 0;
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
    clearTimeout(this._previewTimeOut);
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
            const doubleDelete = new Double();
            doubleDelete.setMood(this.doubleToUpload.mood);
            doubleDelete.spotifyFeatures = {
              key: -this.doubleToUpload.spotifyFeatures.key,
              mode: -this.doubleToUpload.spotifyFeatures.mode,
              time_signature: -this.doubleToUpload.spotifyFeatures.time_signature,
              acousticness: -this.doubleToUpload.spotifyFeatures.acousticness,
              danceability: -this.doubleToUpload.spotifyFeatures.danceability,
              energy: -this.doubleToUpload.spotifyFeatures.energy,
              instrumentalness: -this.doubleToUpload.spotifyFeatures.instrumentalness,
              liveness: -this.doubleToUpload.spotifyFeatures.liveness,
              loudness: -this.doubleToUpload.spotifyFeatures.loudness,
              speechiness: -this.doubleToUpload.spotifyFeatures.speechiness,
              valence: -this.doubleToUpload.spotifyFeatures.valence,
              tempo: -this.doubleToUpload.spotifyFeatures.tempo,
              popularity: -this.doubleToUpload.spotifyFeatures.popularity
            }
            this.learningService.uploadPersonal(doubleDelete, this.userProfile.ID, this.shared.getCurrentMood(), true);
            if (doubleDelete.mood === this.shared.getTargetMood()) {
              this.wrongFeedback = this.wrongFeedback + 2;
            }
            this.feedbackPerTrack[this.currentIndexPlaying].waitNewFeedback = false;
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

  /* ALERT BAD RECOMMENDATION */
  private async alertRecommendation() {
    const alert = await this.alertController.create({
      header: 'Oops',
      cssClass: 'alertClassError',
      message: 'It seems the algorithm is not working! Please search a song that makes you ' + this.shared.getTargetMood(),
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
          handler: () => {
            if (window.location.href.includes('localhost')) {
              window.location.href = 'http://localhost:8100/tab/search';
            }
            else {
              window.location.href = 'moodify-spotify.web.app/tab/search';
            }
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  /* ALERT BAD RECOMMENDATION */
  private async alertNotAvailable() {
    const alert = await this.alertController.create({
      header: 'Not available ... for now :)',
      cssClass: 'alertClassError',
      message: 'This page is not available now ' + this.shared.getTargetMood(),
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
          handler: () => {
            if (window.location.href.includes('localhost')) {
              window.location.href = 'http://localhost:8100/tab/search';
            }
            else {
              window.location.href = 'moodify-spotify.web.app/tab/search';
            }
          }
        }
      ],
      backdropDismiss: false
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