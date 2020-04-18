import { AlertController } from '@ionic/angular';
import { IP_geolocalization } from './../services/IP_geolocalization.service';
import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  providers: [IP_geolocalization]
})
export class Tab1Page {

  country_code: string = '';
  searchFavArtist: Array<{ key: string, image: any, name: string }> = [];
  deviceId: string[] = [];
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
  soundPlayer = new Audio();
  current_preview: any = undefined;
  current_playing: any = undefined;
  spotifyWindow: any;
  _previewIntervalHandler: any;
  _playIntervalHandler: any;

  constructor(private shared: SharedParamsService, private geoLocal: IP_geolocalization, private alertController: AlertController) {
    spotifyApi.setAccessToken(shared.getToken());
    this.initializeDeviceReady();
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_code = data.country_code;
      console.log(data);
    });
  }

  initializeDeviceReady() {
    spotifyApi.getMyDevices().then((response => {
      if (response !== undefined) {
        for (let i = 0; i < response.devices.length; i++) {
          this.deviceId.push(response.devices[i].id);
        }
      }
    }));
  }

  searchMusic($event) {
    if ($event.detail.value.length > 0) {
      let dataSearch: { key: string, image: any, name: string };
      if (this.searchFavArtist.length > 0) {
        this.searchFavArtist = [];
      }
      spotifyApi.search($event.detail.value, ['artist'], { market: this.country_code, limit: 5, offset: 0 }).then((response) => {
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
            this.searchFavArtist.push(dataSearch);
          }
        }
      });
    }
  }

  onClickArtist(idArtist: string) {
    this.recommendedMusicArray = [];
    this.stop(null);
    let data: {
      uriID: string, nomi_artisti: any[], image: any,
      currentlyPlayingPreview: boolean, currentlyPlayingSong: boolean,
      duration: number, nome_album: string, preview_url: string, external_urls: string
    };
    spotifyApi.getRecommendations({
      limit: 5,
      market: this.country_code,
      seed_artists: idArtist,
      min_acousticness: 0.1,
      max_acousticness: 0.9,
      min_danceability: 0.4,
      max_danceability: 0.5,
    }).then((response) => {
      if (response !== undefined) {
        for (let i = 0; i < response.tracks.length; i++) {
          if (response.tracks[i].album.images.length !== 0) {
            data = {
              uriID: response.tracks[i].uri,
              nomi_artisti: response.tracks[i].artists,
              image: response.tracks[i].album.images[1].url,  //even if it say that there is an error it works
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
    }, err => {
      console.log(err);
    });
  }

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

  playMusics(uri: string) {
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

  async progressBar() {
    this._previewIntervalHandler = setInterval(() => {
    }, 100);
  }

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
}
