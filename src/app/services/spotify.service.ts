import { SharedParamsService } from './shared-params.service';
import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private spotifyApi;

  constructor(private shared: SharedParamsService) {
    this.spotifyApi = new SpotifyWebApi();
    this.setSpotifyApiToken();
  }

  setSpotifyApiToken() {
    this.spotifyApi.setAccessToken(this.shared.getToken());
  }

  getSpotifyApi() {
    return this.spotifyApi;
  }
}
