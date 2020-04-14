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
  suggestfavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  searchFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  selectedFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  singerDiv = true;
  preventSearchBug = false;

  //Genres variables
  topGenresMap = {};
  availabeSeedGenres = [];
  favGenres: Map<string, boolean> = new Map();
  hatedGenres: Map<string, boolean> = new Map();

  constructor(private formBuilder: FormBuilder, private shared: SharedParamsService, private alertController: AlertController) {
    spotifyApi.setAccessToken(shared.getToken());
    this.initializeGenresSeeds();
    spotifyApi.getMe().then((response) => {
      this.userProfilePhoto = response.images[0].url;
      if (this.userProfilePhoto === undefined) {
        this.userProfilePhoto = 'assets/img/noImgAvailable.png';
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
      if (response !== undefined) {
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
          if (i < 10) {
            let data = { key: response.items[i].id, image: response.items[i].images[0].url, name: response.items[i].name, checked: false };
            this.suggestfavArtist.push(data);
          }
        }
        this.topGenresMap = this.sortProperties(this.topGenresMap);
      }
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
      if (response !== undefined) {
        this.availabeSeedGenres = response.genres;
        for (let i = 0; i < response.genres.length; i++) {
          this.favGenres.set(this.availabeSeedGenres[i], true);
          this.hatedGenres.set(this.availabeSeedGenres[i], true);
        }
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
  updateSingerPref(whereSelected, singer) {
    const dataSearch = this.searchFavArtist.find(artist => artist.key === singer);
    const dataSelected = this.selectedFavArtist.find(artist => artist.key === singer);
    const dataSuggest = this.suggestfavArtist.find(artist => artist.key === singer);
    switch (whereSelected) {
      case 'search':
        if (!this.preventSearchBug) {
          if (dataSearch !== undefined) {
            this.searchFavArtist[this.searchFavArtist.indexOf(dataSearch)].checked = !dataSearch.checked;
            const newDataSearch = this.searchFavArtist.find(artist => artist.key === singer);
            //I add it to
            if (dataSelected === undefined) {
              this.selectedFavArtist.push(newDataSearch);
              if (dataSuggest !== undefined) {
                this.suggestfavArtist[this.suggestfavArtist.indexOf(dataSuggest)].checked = true;
              }
            }
            //I delete it
            else {
              this.selectedFavArtist.splice(this.selectedFavArtist.indexOf(dataSelected), 1);
              if (dataSuggest !== undefined) {
                this.suggestfavArtist[this.suggestfavArtist.indexOf(dataSuggest)].checked = false;
              }
            }
          }
        }
        this.preventSearchBug = false;
        break;
      case 'favorite':
        if (dataSearch !== undefined) {
          this.searchFavArtist[this.searchFavArtist.indexOf(dataSearch)].checked = false;
        }
        if (dataSuggest !== undefined) {
          this.suggestfavArtist[this.suggestfavArtist.indexOf(dataSuggest)].checked = false;
        }
        if (dataSelected !== undefined) {
          this.selectedFavArtist.splice(this.selectedFavArtist.indexOf(dataSelected), 1);
        }
        if (dataSearch !== undefined) {
          this.preventSearchBug = true;
        }
        break;
      case 'suggest':
        this.suggestfavArtist[this.suggestfavArtist.indexOf(dataSuggest)].checked = true;
        const newDataSuggest = this.suggestfavArtist.find(artist => artist.key === singer);
        if (dataSelected === undefined) {
          this.selectedFavArtist.push(this.suggestfavArtist[this.suggestfavArtist.indexOf(newDataSuggest)]);
        }
        if (dataSearch !== undefined) {
          this.searchFavArtist[this.searchFavArtist.indexOf(dataSearch)].checked = true;
        }
        if (dataSearch !== undefined) {
          this.preventSearchBug = true;
        }
        break;
      default: break;
    }
    console.log(this.selectedFavArtist);
  }

  searchArtist($event) {
    let dataSearch: { key: string, image: any, name: string, checked: boolean };
    let dataSelected: { key: string, image: any, name: string, checked: boolean };
    let check: boolean;
    if (this.searchFavArtist.length > 0) {
      this.searchFavArtist = [];
    }
    if ($event.detail.value.length > 0) {
      spotifyApi.search($event.detail.value, ['artist'], { market: "US", limit: 5, offset: 0 }).then((response) => {
        if (response !== undefined) {
          for (let i = 0; i < response.artists.items.length; i++) {
            dataSelected = this.selectedFavArtist.find(artist => artist.key === response.artists.items[i].id);
            if (dataSelected !== undefined) {
              check = true;
            }
            else {
              check = false;
            }
            if (response.artists.items[i].images.length !== 0) {
              dataSearch = {
                key: response.artists.items[i].id,
                image: response.artists.items[i].images[0].url,
                name: response.artists.items[i].name,
                checked: check
              };
            }
            else {
              dataSearch = {
                key: response.artists.items[i].id,
                image: 'https://lh3.googleusercontent.com/proxy/ykknV-Vf4pceXd2LkKAt9dS7n5IAbKHi4sis0hh1izt32fD85RUYjr0baM4Il58GmdHd0N3z3QyM0xndYoXrR3Cl0gAJHfs9Bm2AhclUqxqoKqw6ZePf8sDXQdreWN-xjlAKuCC7lH2vnVTolXJ8EPp_-Cq3gg11pTo',
                name: response.artists.items[i].name,
                checked: check
              };
            }
            this.searchFavArtist.push(dataSearch);
          }
        }
      });
    }
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
