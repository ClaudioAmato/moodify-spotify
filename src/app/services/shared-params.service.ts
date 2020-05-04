import { keyTargetMood, keyExpirationToken, keyToken, keyRefreshToken } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { keyCurrentMood } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedParamsService {

  constructor() {
  }

  /* SETTERS */
  public setToken(data) {
    localStorage.setItem(keyToken, data);
  }

  public setRefreashToken(data) {
    localStorage.setItem(keyRefreshToken, data);
  }

  public setExpirationToken(time) {
    localStorage.setItem(keyExpirationToken, time);
  }

  public setCurrentMood(currentMood) {
    localStorage.setItem(keyCurrentMood, currentMood);
  }

  public setTargetMood(targetMood) {
    localStorage.setItem(keyTargetMood, targetMood);
  }

  /* GETTERS */
  public getRefreashToken() {
    return localStorage.getItem(keyRefreshToken);
  }

  public getToken() {
    return localStorage.getItem(keyToken);
  }

  public checkExpirationToken() {
    const ONE_HOUR = 59 * 60 * 1000; // 59 minutes after expiration in millisecond
    const currentDate = new Date();
    const storageDate = new Date(JSON.parse(JSON.stringify(localStorage.getItem(keyExpirationToken))));
    // an hour is passed
    if (((currentDate.getTime() - storageDate.getTime()) > ONE_HOUR)) {
      localStorage.removeItem(keyExpirationToken);
      return true;
    }
    else {
      return false;
    }
  }

  public getCurrentMood() {
    return localStorage.getItem(keyCurrentMood);
  }

  public getTargetMood() {
    return localStorage.getItem(keyTargetMood);
  }
}
