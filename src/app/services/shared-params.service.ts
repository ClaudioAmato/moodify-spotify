import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedParamsService {

  token: string;
  refreashToken: string;

  constructor() { }

  public setToken(data) {
    this.token = data;
  }

  public setRefreashToken(data) {
    this.refreashToken = data;
  }

  public getRefreashToken() {
    return this.refreashToken;
  }

  public getToken() {
    return this.token;
  }
}
