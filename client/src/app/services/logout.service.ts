import { keyCurrentMood } from 'src/environments/environment';
import { keyToken, keyRefreshToken, keyExpirationToken, keyTargetMood, keyUserProfile } from './../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor() { }

  /* REMOVERS */
  public removeToken() {
    localStorage.removeItem(keyToken);
  }

  public removeRefreshToken() {
    localStorage.removeItem(keyRefreshToken);
  }

  public removeExpirationToken() {
    localStorage.removeItem(keyExpirationToken);
  }

  public removeCurrentMood() {
    localStorage.removeItem(keyCurrentMood);
  }

  public removeTargetMood() {
    localStorage.removeItem(keyTargetMood);
  }

  public removeUser() {
    localStorage.removeItem(keyUserProfile);
  }

  public removeAllShared() {
    this.removeToken();
    this.removeRefreshToken();
    this.removeExpirationToken();
    this.removeCurrentMood();
    this.removeTargetMood();
    this.removeUser();
  }

  logout() {
    this.removeAllShared();
    if (window.location.href.includes('localhost')) {
      window.location.href = 'http://localhost:8100/login';
    }
    else {
      window.location.href = 'moodify-spotify.web.app/login';
    }
  }
}
