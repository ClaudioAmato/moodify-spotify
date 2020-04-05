import { GoogleGeolocalization } from './../services/googleGeolocalization.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [GoogleGeolocalization]
})
export class LoginPage implements OnInit {

  country_code: string = '';

  constructor(private geoLocal: GoogleGeolocalization) {
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_code = data.country_code;
      console.log(data);
    });
  }
}
