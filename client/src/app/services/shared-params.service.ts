import { keyTargetMood, keyExpirationToken, keyToken, keyRefreshToken, keyPreviousDay } from './../../environments/environment';
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

  public setPreviousDay(time) {
    localStorage.setItem(keyPreviousDay, time);
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

  public getExpirationToken() {
    return localStorage.getItem(keyExpirationToken);
  }

  public getPreviousDay() {
    return localStorage.getItem(keyPreviousDay);
  }

  public checkExpirationToken() {
    const ONE_HOUR = 59 * 60 * 1000; // 59 minutes after expiration in millisecond
    const currentDate = new Date();
    const storageDate = new Date(JSON.parse(JSON.stringify(this.getExpirationToken())));
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

  /* REMOVERS */
  public removeToken() {
    localStorage.removeItem(keyToken);
  }

  public removeRefreashToken() {
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
}
