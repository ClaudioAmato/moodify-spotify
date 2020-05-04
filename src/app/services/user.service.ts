import { dataBase } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  public addUser(idUser, email) {
    return this.http.post(dataBase + '/account.json', {
      id: idUser,
      email: email
    }).pipe(tap(response => {
      console.log(response);
    }));
  }
}
