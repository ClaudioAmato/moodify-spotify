import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedParamsService {

  token: any;

  constructor() { }

  public setToken(data) {
    this.token = data;
  }

  public getToken() {
    return this.token;
  }

}
