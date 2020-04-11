import { SharedParamsService } from './../services/shared-params.service';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import SpotifyWebApi from 'spotify-web-api-js';
import { AlertController } from '@ionic/angular';

const spotifyApi = new SpotifyWebApi();

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  registrationForm = this.formBuilder.group({
    favGenres: [''],
    hatedGenres: [''],
    favoriteSingers: ['']
  });

  // User varialbes
  userProfilePhoto: any;
  email: any;
  name: any;
  country: any;
  url: any;

  //Artists variables
  topArtistsMap = {};
  favArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  selectedFavArtistID: string[] = [];
  singerDiv = false;

  //Genres variables
  topGenresMap = {};
  availabeSeedGenres = [];
  favGenres: Map<string, boolean> = new Map();
  hatedGenres: Map<string, boolean> = new Map();

  constructor(private formBuilder: FormBuilder, private shared: SharedParamsService, private alertController: AlertController) {
    //console.log(shared.getToken());
    spotifyApi.setAccessToken(shared.getToken());
    this.initializeGenresSeeds();
    spotifyApi.getMe().then((response) => {
      this.userProfilePhoto = response.images[0].url;
      if (this.userProfilePhoto === undefined) {
        this.userProfilePhoto = 'https://t3.ftcdn.net/jpg/00/64/67/80/240_F_64678017_zUpiZFjj04cnLri7oADnyMH0XBYyQghG.jpg';
      }
      console.log(response);
      this.email = response.email;
      this.name = response.display_name;
      this.country = response.country;
      this.url = response.external_urls.spotify;
      this.autoSearchFavGenres(); // in registrationForm.controls['favGenres']
    });
  }

  // Function that search for your favorite musics' genres
  // based on your top artis's music genres
  autoSearchFavGenres() {
    spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
      for (let i = 0; i < response.items.length; i++) {
        //cycle on all the genres of the artist
        for (let j = 0; j < response.items[i].genres.length; j++) {
          if (this.topGenresMap[response.items[i].genres[j]] === undefined) {
            this.topGenresMap[response.items[i].genres[j]] = 1;
          }
          else {
            this.topGenresMap[response.items[i].genres[j]] += 1;
          }
        }
        let data = { key: response.items[i].id, image: response.items[i].images[0].url, name: response.items[i].name, checked: false };
        this.favArtist.push(data);
      }
      this.topGenresMap = this.sortProperties(this.topGenresMap);
      //console.log(this.topGenresMap);
    });
    //this.registrationForm.controls['favGenres'].setValue();
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

  /* FAVORITE AND HATED GENRES */
  // Function that search for your favorite musics' genres
  // based on your top artis's music genres
  initializeGenresSeeds() {
    spotifyApi.getAvailableGenreSeeds().then((response) => {
      this.availabeSeedGenres = response.genres;
      for (let i = 0; i < response.genres.length; i++) {
        this.favGenres.set(this.availabeSeedGenres[i], true);
        this.hatedGenres.set(this.availabeSeedGenres[i], true);
      }
    });
  }

  refreshHatedGenres(maxValid: number) {
    let i = 0;
    let favGenresLenght = this.registrationForm.controls.favGenres.value.length;
    if (favGenresLenght > maxValid) {
      this.alertMaxGenresExceeded(maxValid, favGenresLenght - maxValid);
      this.registrationForm.controls.favGenres.value.splice(maxValid, favGenresLenght - maxValid);
    }
    for (i = 0; i < this.availabeSeedGenres.length; i++) {
      this.hatedGenres.set(this.availabeSeedGenres[i], true);
    }
    for (i = 0; i < this.registrationForm.controls.favGenres.value.length; i++) {
      this.hatedGenres.set(this.registrationForm.controls.favGenres.value[i], false);
    }
  }

  refreshFavGenres(maxValid: number) {
    let i = 0;
    let hatedGenresLenght = this.registrationForm.controls.hatedGenres.value.length;
    if (hatedGenresLenght > maxValid) {
      this.alertMaxGenresExceeded(maxValid, hatedGenresLenght - maxValid);
      this.registrationForm.controls.hatedGenres.value.splice(maxValid, hatedGenresLenght - maxValid);
    }
    for (i = 0; i < this.availabeSeedGenres.length; i++) {
      this.favGenres.set(this.availabeSeedGenres[i], true);
    }
    for (i = 0; i < this.registrationForm.controls.hatedGenres.value.length; i++) {
      this.favGenres.set(this.registrationForm.controls.hatedGenres.value[i], false);
    }
  }

  /* ALERTS CHECK */
  async alertMaxGenres(maxValid: number) {
    const alert = await this.alertController.create({
      header: 'Warning',
      cssClass: 'alertClassWarning',
      message: 'Select at most ' + maxValid + ' genres',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  async alertMaxGenresExceeded(maxValid: number, numExceed: number) {
    const alert = await this.alertController.create({
      header: 'Max genres\' number exceeded of ' + numExceed,
      cssClass: 'alertClassDanger',
      message: 'Only the first ' + maxValid + ' genres will be considered',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  /* SINGER PREFERENCES */
  showSingerPref() {
    this.singerDiv = !this.singerDiv;
  }
  updateSingerPref(singer) {
    let data = this.favArtist.find(artist => artist.key === singer);
    this.favArtist[this.favArtist.indexOf(data)].checked = !this.favArtist[this.favArtist.indexOf(data)].checked;
    if (data.checked === true) {
      this.selectedFavArtistID.push(data.key);
    } else {
      this.selectedFavArtistID.splice(this.selectedFavArtistID.indexOf(data.key), 1);
    }
    console.log(this.selectedFavArtistID);
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
