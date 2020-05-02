import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedParamsService {

  constructor() {
  }

  /* SETTERS */
  public setToken(key, data) {
    localStorage.setItem(key, data);
  }

  public setRefreashToken(key, data) {
    localStorage.setItem(key, data);
  }

  public setExpirationToken(key, time) {
    localStorage.setItem(key, time)
  }

  public setCurrentMood(key, currentMood) {
    localStorage.setItem(key, currentMood)
  }

  public setTargetMood(key, targetMood) {
    localStorage.setItem(key, targetMood)
  }

  /* GETTERS */
  public getRefreashToken(key) {
    return localStorage.getItem(key);
  }

  public getToken(key) {
    return localStorage.getItem(key);
  }

  public checkExpirationToken(key) {
    const ONE_HOUR = 59 * 60 * 1000; // 59 minutes after expiration in millisecond
    const currentDate = new Date();
    const storageDate = new Date(JSON.parse(JSON.stringify(localStorage.getItem(key))));
    return ((currentDate.getTime() - storageDate.getTime()) > ONE_HOUR);
  }

  public getCurrentMood(key) {
    return localStorage.getItem(key)
  }

  public getTargetMood(key) {
    return localStorage.getItem(key)
  }
}
