import { IP_geolocalization } from './../services/IP_geolocalization.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [IP_geolocalization]
})
export class LoginPage implements OnInit {

  country_code: string = '';

  constructor(private geoLocal: IP_geolocalization) {
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_code = data.country_code;
      console.log(data);
    });
  }

  onClickLogin() {
    window.location.href = 'http://localhost:8888/login';
  }
}
