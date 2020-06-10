import { SharedParamsService } from './shared-params.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(private shared: SharedParamsService) { }

  logout() {
    this.shared.removeToken();
    this.shared.removeRefreashToken();
    this.shared.removeExpirationToken();
    this.shared.removeCurrentMood();
    this.shared.removeTargetMood();
    this.shared.removeFavGenres();
    this.shared.removeFavSinger();
    this.shared.removeHatedGenres();
    this.shared.removeUserId();
    if (window.location.href.includes('localhost')) {
      window.location.href = 'http://localhost:8100/login';
    }
    else {
      window.location.href = 'moodify-spotify.web.app/login';
    }
  }
}
