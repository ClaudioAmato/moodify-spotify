import { SharedParamsService } from './../services/shared-params.service';
import { GoogleGeolocalization } from './../services/googleGeolocalization.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  registrationForm = this.formBuilder.group({
    email: [''],
    password: [''],
    name: [''],
    surname: [''],
    age: [''],
    sex: [''],
    country: [''],
    favGeneres: [''],
    hatedGeneres: [''],
    favoriteSingers: ['']
  });

  country_name: string;
  image: any;

  constructor(private formBuilder: FormBuilder, private geoLocal: GoogleGeolocalization, private shared: SharedParamsService) {
    console.log(shared.getToken());
    spotifyApi.setAccessToken(shared.getToken());
    spotifyApi.getMe().then((response) => {
      this.image = response.images[0].url;
    });
  }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_name = data.country_name;
      console.log(this.country_name);
    });
  }

  public submit() {
    console.log(this.registrationForm.value);
  }
}
