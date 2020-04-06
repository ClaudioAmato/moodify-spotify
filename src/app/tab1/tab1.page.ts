import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {

  params: any;
  token: any;
  state: {
    loggedIn: boolean,
    nowPlaying: {
      name: string,
      albumArt: string,
    }
  }

  constructor(private shared: SharedParamsService) {
    this.params = this.getHashParams();
    this.token = this.params.access_token;
    if (this.token) {
      spotifyApi.setAccessToken(this.token);
    }
    this.state = {
      loggedIn: this.token ? true : false,
      nowPlaying: { name: null, albumArt: null },
    };
    shared.setToken(this.token);
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

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      if (response === undefined) {

      }
      else {
        this.state = {
          loggedIn: this.state.loggedIn,
          nowPlaying: { name: response.item.name, albumArt: response.item.album.images[0].url },
        };
      }
      console.log(response);
    });
  }

  searchMusic($event) {
    /* this._spotifyService.searchMusic($event.detail.value, 'artist', null, null, null, this.token).subscribe(res => {
      console.log(res);
    }); */
    spotifyApi.search($event.detail.value, ['artist'], { market: "US", limit: 5, offset: 1 }).then((response) => {
      console.log(response);
    });
  }



}
