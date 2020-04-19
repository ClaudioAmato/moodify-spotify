import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedParamsService {

  constructor() {
  }

  public setToken(key, data) {
    localStorage.setItem(key, data);
  }

  public setRefreashToken(key, data) {
    localStorage.setItem(key, data);
  }

  public setExpirationToken(key, time) {
    localStorage.setItem(key, time)
  }

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
}
