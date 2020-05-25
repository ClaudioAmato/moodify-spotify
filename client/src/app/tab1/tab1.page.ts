import { EmojisService } from './../services/emojis.service';
import { Tripla } from './../dataTriple/tripla';
import { AlertController, NavController } from '@ionic/angular';
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

  // recommendation variables
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

  // emojis
  arrayEmoji: Array<{ name: string, image: string }> = [];
  divEmoji = false;

  // Player variables
  soundPlayer = new Audio();
  current_preview: any = undefined;
  current_playing: any = undefined;
  spotifyWindow: any;
  _previewIntervalHandler: any;
  _playIntervalHandler: any;

  constructor(private shared: SharedParamsService, private alertController: AlertController,
    private emoji: EmojisService, private navCtrl: NavController) {
    if (this.shared.checkExpirationToken()) {
      this.alertTokenExpired();
    }
    else {
      this.spotifyApi.setAccessToken(this.shared.getToken());
      this.arrayEmoji = this.emoji.getArrayEmoji();
    }
    if (this.shared.getCurrentMood() != null && this.shared.getTargetMood !== null) {
      console.log(this.shared.getCurrentMood());
      console.log(this.shared.getTargetMood());
    }
  }

  // this function let user searching an artist
  searchMusic($event) {
    if (this.searchTrack.length > 0) {
      this.searchTrack = [];
    }
    if ($event.detail.value.length > 0) {
      let dataSearch: { key: string, image: any, name: string };
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.search($event.detail.value, ['track'], { /*market: this.country_code,*/ limit: 5, offset: 0 }).then((response) => {
          if (response !== undefined) {
            for (let i = 0; i < response.tracks.items.length; i++) {
              if (response.tracks.items[i].album.images.length !== 0) {
                dataSearch = {
                  key: response.tracks.items[i].id,
                  image: response.tracks.items[i].album.images[1].url,
                  name: response.tracks.items[i].name,
                };
              }
              else {
                dataSearch = {
                  key: response.tracks.items[i].id,
                  image: 'assets/img/noImgAvailable.png',
                  name: response.tracks.items[i].name,
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

  // This function uses spotify for searching a music/song
  onClickTrack(idTrack: string) {
    this.stop(null);
    this.spotifyApi.getTrack(idTrack).then((response) => {
      if (response !== undefined) {
        if (response.album.images[1].url !== undefined) {
          this.currentMusicplaying = {
            uriID: response.uri,
            idTrack: idTrack,
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
            idTrack: idTrack,
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
    }).catch(err => {
      console.log(err);
    });
  }

  openDivEmoji() {
    this.divEmoji = true;
  }

  onGivenFeedback(feedback: string) {
    this.divEmoji = false;
    this.spotifyApi.getAudioFeaturesForTrack(this.currentMusicplaying.idTrack).then((response) => {
      let triple = new Tripla(this.currentMusicplaying.idTrack);
      if (this.arrayTriple.length === 0) {
        triple.setPreviusMood(this.shared.getCurrentMood());
      }
      else {
        triple.setPreviusMood(
          this.arrayTriple[this.arrayTriple.length - 1].getNewMood()
        );
      }
      triple.setNewMood(feedback);
      triple.setSpotifyData(
        response.duration_ms,
        response.key,
        response.mode,
        response.time_signature,
        response.acousticness,
        response.danceability,
        response.energy,
        response.instrumentalness,
        response.liveness,
        response.loudness,
        response.speechiness,
        response.valence,
        response.tempo
      );
      this.arrayTriple.push(triple);
      console.log(this.arrayTriple);

    }).catch(err => {
      console.log(err);
    });;
  }

  // this function open spotify browser and play the selected song/music
  openSpotifyPlayer(external_urls: string) {
    if (this.current_playing !== undefined) {
      this.currentMusicplaying.currentlyPlayingSong = false;
      this.current_playing = undefined;
    }
    if (this.current_preview !== undefined) {
      this.stop(this.current_preview.uriID);
    }
    if (this.currentMusicplaying !== undefined) {
      this.current_playing = this.currentMusicplaying;
      if (this.currentMusicplaying.external_urls !== null) {
        this.currentMusicplaying.currentlyPlayingSong = true;
        this.spotifyWindow = window.open(external_urls, '_blank');
        this.checkWindowClosed(this.currentMusicplaying);
      } setTimeout(() => {
        this.current_playing = undefined;
        this.currentMusicplaying.currentlyPlayingSong = false;
      }, this.currentMusicplaying.duration);
    }
  }

  // this function checks every 2 seconds if the opened window
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
    }, 2000);
  }

  // this function play the preview of the song if it is available
  playPreview(uri: string) {
    // if current playing
    if (this.soundPlayer.currentTime > 0) {
      this.stop(this.current_preview.uriID);
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
    this.current_preview = undefined;
    this.current_playing = undefined;
    if (uri !== null) {
      if (this.currentMusicplaying !== undefined) {
        this.currentMusicplaying.currentlyPlayingPreview = false;
      }
    }
  }

  // Logout form the website
  logout() {
    this.shared.removeToken();
    this.shared.removeRefreashToken();
    this.shared.removeExpirationToken();
    this.shared.removeCurrentMood();
    this.shared.removeTargetMood();
    window.location.href = 'http://localhost:8100/login';
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

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }
}
