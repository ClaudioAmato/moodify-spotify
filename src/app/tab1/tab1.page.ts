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

  params: any;
  token: string;
  state: {
    nowPlaying: {
      name: string,
      albumArt: string,
    }
  }
  country_code: string = '';
  searchFavArtist: Array<{ key: string, image: any, name: string }> = [];
  deviceId: string[] = [];
  arrayMusic = [];
  currentPlaying: string = null;

  constructor(private shared: SharedParamsService, private geoLocal: IP_geolocalization) {
    this.params = this.getHashParams();
    this.token = this.params.access_token;
    if (this.token) {
      spotifyApi.setAccessToken(this.token);
    }
    shared.setToken(this.token);
    shared.setRefreashToken(this.params.refresh_token);
    this.initializeDeviceReady();
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_code = data.country_code;
      console.log(data);
    });
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

  /*getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      if (response === undefined) {

      }
      else {
        this.state = {
          nowPlaying: { name: response.item.name, albumArt: response.item.album.images[0].url },
        };
      }
      console.log(response);
    });
  }*/

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
                image: response.artists.items[i].images[0].url,
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
    this.arrayMusic = [];
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
          this.arrayMusic.push(response.tracks[i].external_urls.spotify);
        }
        this.playMusics(this.arrayMusic);
      }
    }, err => {
      console.log(err);
    });
  }

  playMusics(arrayMusic: any[]) {
    this.currentPlaying = null;
    for (let i = 0; i < arrayMusic.length; i++) {
      if (arrayMusic[i] != null) {
        this.currentPlaying = arrayMusic[i].slice(0, 25) + "embed/" + arrayMusic[i].slice(0, arrayMusic[i].length);
        console.log("non null, " + this.currentPlaying);
        break;
      }
      else {
        console.log("null, " + arrayMusic[i]);
      }
    }
    //console.log(this.deviceId);
    //spotifyApi.transferMyPlayback(this.deviceId, { play: true });
  }

}
