import { SpotifyService } from './../services/spotify.service';
import { MoodGuardService } from './../services/mood-guard.service';
import { AlertController, Platform } from '@ionic/angular';
import { IP_geolocalization } from './../services/IP_geolocalization.service';
import { SharedParamsService } from './../services/shared-params.service';
import { Component, OnInit } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  providers: [IP_geolocalization]
})
export class Tab1Page implements OnInit {

  //spotifyApi
  spotifyApi;

  country_code: string = '';

  // recommendation variables
  searchArtist: Array<{ key: string, image: any, name: string }> = [];
  recommendedMusicArray: Array<{
    uriID: string,
    nomi_artisti: any[],
    image: any,
    currentlyPlayingPreview: boolean,
    currentlyPlayingSong: boolean,
    duration: number,
    nome_album: string,
    preview_url: string,
    external_urls: string
  }> = [];

  // Player variables
  soundPlayer = new Audio();
  current_preview: any = undefined;
  current_playing: any = undefined;
  spotifyWindow: any;
  _previewIntervalHandler: any;
  _playIntervalHandler: any;

  constructor(private spotifyService: SpotifyService, private shared: SharedParamsService,
    private geoLocal: IP_geolocalization, private alertController: AlertController,
    private moodGuard: MoodGuardService) {
    if (this.moodGuard.checkMood()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi = this.spotifyService.getSpotifyApi();
      }
      console.log(this.shared.getCurrentMood());
      console.log(this.shared.getTargetMood());
    }
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_code = data.country_code;
    });
  }

  // this function let user searching an artist
  searchMusic($event) {
    if (this.searchArtist.length > 0) {
      this.searchArtist = [];
    }
    if ($event.detail.value.length > 0) {
      let dataSearch: { key: string, image: any, name: string };
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.search($event.detail.value, ['artist'], { market: this.country_code, limit: 5, offset: 0 }).then((response) => {
          if (response !== undefined) {
            for (let i = 0; i < response.artists.items.length; i++) {
              if (response.artists.items[i].images.length !== 0) {
                dataSearch = {
                  key: response.artists.items[i].id,
                  image: response.artists.items[i].images[1].url,
                  name: response.artists.items[i].name,
                };
              }
              else {
                dataSearch = {
                  key: response.artists.items[i].id,
                  image: 'assets/img/noImgAvailable.png',
                  name: response.artists.items[i].name,
                };
              }
              this.searchArtist.push(dataSearch);
            }
          }
        }).catch(err => {
          console.log(err);
        });
      }
    }
  }

  // This function uses spotify recommendation for searching a music/song
  // it add into an array these musics/songs
  onClickArtist(idArtist: string) {
    this.recommendedMusicArray = [];
    this.stop(null);
    let data: {
      uriID: string, nomi_artisti: any[], image: any,
      currentlyPlayingPreview: boolean, currentlyPlayingSong: boolean,
      duration: number, nome_album: string, preview_url: string, external_urls: string
    };
    this.spotifyApi.getRecommendations({
      limit: 5,
      market: this.country_code,
      seed_artists: idArtist,
      min_acousticness: 0.1,
      max_acousticness: 0.9,
      min_danceability: 0.4,
      max_danceability: 0.5,
    }).then((response) => {
      if (response !== undefined) {
        let tracksIDs: string[] = [];
        for (let i = 0; i < response.tracks.length; i++) {
          tracksIDs[i] = response.tracks[i].id;
        }
        if (tracksIDs.length > 0) {
          this.spotifyApi.getTracks(tracksIDs).then((response2) => {
            if (response2 !== undefined) {
              for (let i = 0; i < response2.tracks.length; i++) {
                if (response2.tracks[i].album.images[1].url !== undefined) {
                  data = {
                    uriID: response.tracks[i].uri,
                    nomi_artisti: response.tracks[i].artists,
                    image: response2.tracks[i].album.images[1].url,
                    currentlyPlayingPreview: false,
                    currentlyPlayingSong: false,
                    duration: response.tracks[i].duration_ms,
                    nome_album: response.tracks[i].name,
                    preview_url: response.tracks[i].preview_url,
                    external_urls: response.tracks[i].external_urls.spotify
                  };
                }
                else {
                  data = {
                    uriID: response.tracks[i].uri,
                    nomi_artisti: response.tracks[i].artists,
                    image: 'assets/img/noImgAvailable.png',
                    currentlyPlayingPreview: false,
                    currentlyPlayingSong: false,
                    duration: response.tracks[i].duration_ms,
                    nome_album: response.tracks[i].name,
                    preview_url: response.tracks[i].preview_url,
                    external_urls: response.tracks[i].external_urls.spotify
                  };
                }
                this.recommendedMusicArray.push(data);
              }
            }
          });
        }
        else {
          console.log("no tracks found because are empty");
        }
      }
    });
  }

  // this function open spotify browser and play the selected song/music
  openSpotifyPlayer(external_urls: string) {
    if (this.current_playing !== undefined) {
      this.recommendedMusicArray[this.recommendedMusicArray.indexOf(this.current_playing)].currentlyPlayingSong = false;
      this.current_playing = undefined;
    }
    if (this.current_preview !== undefined) {
      this.stop(this.current_preview.uriID);
    }
    const data = this.recommendedMusicArray.find(url => url.external_urls === external_urls);
    if (data !== undefined) {
      this.current_playing = data;
      const index = this.recommendedMusicArray.indexOf(this.current_playing);
      if (this.recommendedMusicArray[index].external_urls !== null) {
        this.recommendedMusicArray[this.recommendedMusicArray.indexOf(data)].currentlyPlayingSong = true;
        this.spotifyWindow = window.open(external_urls, '_blank');
        this.checkWindowClosed(data);
      } setTimeout(() => {
        this.current_playing = undefined;
        this.recommendedMusicArray[this.recommendedMusicArray.indexOf(data)].currentlyPlayingSong = false;
      }, data.duration);
    }
  }

  // this function checks every 2 seconds if the opened window
  // of spotify music/song is closed and is used for removing
  // the play button image over the album image
  async checkWindowClosed(data: any) {
    this._playIntervalHandler = setInterval(() => {
      if (this.spotifyWindow !== undefined) {
        if (this.spotifyWindow.closed && data !== undefined) {
          this.recommendedMusicArray[this.recommendedMusicArray.indexOf(data)].currentlyPlayingSong = false;
          clearInterval(this._playIntervalHandler);
        }
      }
    }, 2000);
  }

  // this function play the preview of the song if it is available
  playPreview(uri: string) {
    //if current playing
    if (this.soundPlayer.currentTime > 0) {
      this.stop(this.current_preview.uriID);
    }
    let data: any;
    data = this.recommendedMusicArray.find(uriID => uriID.uriID === uri);
    if (data !== undefined) {
      this.current_preview = data;
      const index = this.recommendedMusicArray.indexOf(this.current_preview);
      if (this.recommendedMusicArray[index].preview_url !== null) {
        this.recommendedMusicArray[index].currentlyPlayingPreview = true;
        this.soundPlayer.src = this.recommendedMusicArray[index].preview_url;
        this.soundPlayer.play();
        this.progressBar();
      } setTimeout(() => {
        this.soundPlayer.pause();
        this.soundPlayer.currentTime = 0;
        this.current_preview = undefined;
        data = this.recommendedMusicArray.find(uriID => uriID.uriID === uri);
        if (data !== undefined) {
          this.recommendedMusicArray[this.recommendedMusicArray.indexOf(data)].currentlyPlayingPreview = false;
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
      const data = this.recommendedMusicArray.find(uriID => uriID.uriID === uri);
      if (data !== undefined) {
        this.recommendedMusicArray[this.recommendedMusicArray.indexOf(data)].currentlyPlayingPreview = false;
      }
    }
  }

  /* ALERTS NO PREVIEW BUTTON */
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

  /* ALERTS CHECK EXPIRATION TOKEN */
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
            window.location.href = 'http://localhost:8100/login';
          }
        }
      ],
      backdropDismiss: true
    });
    await alert.present();
  }
}
