import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  registrationForm = this.formBuilder.group({
    email: [''],
    name: [''],
    age: [''],
    sex: [''],
    country: [''],
    favGenres: [''],
    hatedGenres: [''],
    favoriteSingers: ['']
  });

  userProfilePhoto: any;
  topGenresMap = {};
  availabeSeedGenres = [];
  favGenres: Map<string, boolean> = new Map();
  hatedGenres: Map<string, boolean> = new Map();

  constructor(private formBuilder: FormBuilder, private shared: SharedParamsService) {
    //console.log(shared.getToken());
    spotifyApi.setAccessToken(shared.getToken());
    this.initializeGenresSeeds();
    spotifyApi.getMe().then((response) => {
      this.userProfilePhoto = response.images[0].url;
      if (this.userProfilePhoto === undefined) {
        this.userProfilePhoto = "https://t3.ftcdn.net/jpg/00/64/67/80/240_F_64678017_zUpiZFjj04cnLri7oADnyMH0XBYyQghG.jpg";
      }
      console.log(response);
      this.registrationForm.controls['email'].setValue(response.email);
      this.registrationForm.controls['name'].setValue(response.display_name);
      this.registrationForm.controls['country'].setValue(response.country);
      this.autoSearchFavGenres(); // in registrationForm.controls['favGenres']
    });
  }

  autoSearchFavGenres() {
    spotifyApi.getMyTopArtists({ limit: 50, time_range: "long_term" }).then((response) => {
      for (let i = 0; i < response.items.length; i++) {
        for (let j = 0; j < response.items[i].genres.length; j++) {
          if (this.topGenresMap[response.items[i].genres[j]] === undefined) {
            this.topGenresMap[response.items[i].genres[j]] = 1;
          }
          else {
            this.topGenresMap[response.items[i].genres[j]] += 1;
          }
        }
      }
      this.topGenresMap = this.sortProperties(this.topGenresMap);
      console.log(this.topGenresMap);
    });
    //this.registrationForm.controls['favGenres'].setValue();
  }

  initializeGenresSeeds() {
    spotifyApi.getAvailableGenreSeeds().then((response) => {
      this.availabeSeedGenres = response.genres;
      for (let i = 0; i < response.genres.length; i++) {
        this.favGenres.set(this.availabeSeedGenres[i], true);
        this.hatedGenres.set(this.availabeSeedGenres[i], true);
      }
    });
  }

  refreshHatedGenres() {
    for (let i = 0; i < this.registrationForm.controls['favGenres'].value.length; i++) {
      this.hatedGenres.set(this.registrationForm.controls['favGenres'].value[i], false);
    }
  }
  refreshFavGenres() {
    for (let i = 0; i < this.registrationForm.controls['hatedGenres'].value.length; i++) {
      this.favGenres.set(this.registrationForm.controls['hatedGenres'].value[i], false);
    }
  }

  checkValid() {
    console.log(this.hatedGenres);
  }

  sortProperties(obj) {
    // convert object into array
    let sortable = [];
    for (let key in obj)
      if (obj.hasOwnProperty(key))
        sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value order descending
    sortable.sort((a, b) => {
      return b[1] - a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
  }

  checkExpirationToken() {
    //if(expired){
    //window.location.href = 'http://localhost:8888/login';
    //}
  }

  public submit() {
    console.log(this.registrationForm.value);
  }
}
