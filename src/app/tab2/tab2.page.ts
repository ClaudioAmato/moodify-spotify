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
  singerDiv = false;
  preventSearchBug = false;

  //Genres variables
  topGenresMap = {};
  availabeSeedGenres = [];
  favGenresAvailable: Map<string, boolean> = new Map();
  hatedGenresAvailable: Map<string, boolean> = new Map();
  favGenresSelected = [];
  hatedGenresSelected = [];


  constructor(private formBuilder: FormBuilder, private shared: SharedParamsService, private alertController: AlertController) {
    if (this.shared.checkExpirationToken('expirationToken')) {
      this.alertTokenExpired();
    }
    else {
      spotifyApi.setAccessToken(this.shared.getToken('token'));
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
  }

  // Function that submit the user preferences (used for cold start)
  onClickSubmit() {
    console.log("list of fav artist: " + this.selectedFavArtist);
    console.log("list of fav generes: " + this.favGenresSelected);
    console.log("list of hated generes: " + this.hatedGenresSelected);
  }

  // Function that search for your favorite musics' genres
  // based on your top artis's music genres
  autoSearchFavGenres() {
    if (this.shared.checkExpirationToken('expirationToken')) {
      this.alertTokenExpired();
    }
    else {
      spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
        if (response !== undefined) {
          for (let i = 0; i < response.items.length; i++) {
            // cycle on all the genres of the artist
            for (let j = 0; j < response.items[i].genres.length; j++) {
              if (this.topGenresMap[response.items[i].genres[j]] === undefined) {
                this.topGenresMap[response.items[i].genres[j]] = 1;
              }
              else {
                this.topGenresMap[response.items[i].genres[j]] += 1;
              }
            }
            if (i < 10) {
              let data = {
                key: response.items[i].id,
                image: response.items[i].images[0].url,
                name: response.items[i].name,
                checked: false
              };
              this.suggestfavArtist.push(data);
            }
          }
          this.topGenresMap = this.sortProperties(this.topGenresMap);
        }
      });
    }
  }
  // this function sort your top array of
  // genres" from the higher to the lower
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
  // This function get all spotify's seed's genres available
  initializeGenresSeeds() {
    if (this.shared.checkExpirationToken('expirationToken')) {
      this.alertTokenExpired();
    }
    else {
      spotifyApi.getAvailableGenreSeeds().then((response) => {
        if (response !== undefined) {
          this.availabeSeedGenres = response.genres;
          for (let i = 0; i < response.genres.length; i++) {
            this.favGenresAvailable.set(this.availabeSeedGenres[i], true);
            this.hatedGenresAvailable.set(this.availabeSeedGenres[i], true);
          }
        }
      });
    }
  }

  /* REFRESH FAVORITE AND HATED LIST OF GENRES */
  // This function refresh the hated genres available
  // after the user chose from a list of favorite music genres
  refreshHatedGenres(maxValid: number) {
    let i = 0;
    this.favGenresSelected = [];
    let favGenresLenght = this.registrationForm.controls.favGenres.value.length;
    if (favGenresLenght > maxValid) {
      this.registrationForm.controls.favGenres.value.splice(maxValid, favGenresLenght - maxValid);
      this.alertMaxGenresExceeded(maxValid, favGenresLenght - maxValid);
    }
    for (i = 0; i < this.availabeSeedGenres.length; i++) {
      this.hatedGenresAvailable.set(this.availabeSeedGenres[i], true);
    }
    for (i = 0; i < this.registrationForm.controls.favGenres.value.length; i++) {
      this.hatedGenresAvailable.set(this.registrationForm.controls.favGenres.value[i], false);
    }
    // new lenght if max exceeded
    favGenresLenght = this.registrationForm.controls.favGenres.value.length;
    for (i = 0; i < favGenresLenght; i++) {
      this.favGenresSelected[i] = this.registrationForm.controls.favGenres.value[i];
    }
  }

  // This function refresh the favorite genres available
  // after the user chose from a list of hated music genres
  refreshFavGenres(maxValid: number) {
    let i = 0;
    this.hatedGenresSelected = [];
    let hatedGenresLenght = this.registrationForm.controls.hatedGenres.value.length;
    if (hatedGenresLenght > maxValid) {
      this.alertMaxGenresExceeded(maxValid, hatedGenresLenght - maxValid);
      this.registrationForm.controls.hatedGenres.value.splice(maxValid, hatedGenresLenght - maxValid);
    }
    for (i = 0; i < this.availabeSeedGenres.length; i++) {
      this.favGenresAvailable.set(this.availabeSeedGenres[i], true);
    }
    for (i = 0; i < this.registrationForm.controls.hatedGenres.value.length; i++) {
      this.favGenresAvailable.set(this.registrationForm.controls.hatedGenres.value[i], false);
    }
    // new lenght if max exceeded
    hatedGenresLenght = this.registrationForm.controls.hatedGenres.value.length;
    for (i = 0; i < hatedGenresLenght; i++) {
      this.hatedGenresSelected[i] = this.registrationForm.controls.hatedGenres.value[i];
    }
  }

  /* ALERTS WARNING MAX VALID MUSIC GENRES IN FORM */
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

  /* ALERT MAX MUSIC GENERS IN FORM REACHED */
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
  // This function open Div of artist preference
  showSingerPref() {
    this.singerDiv = !this.singerDiv;
  }

  // This function add or remove a favorite artist
  // from an array of the user's favorite artist
  updateSingerPref(whereSelected, singer) {
    const dataSearch = this.searchFavArtist.find(artist => artist.key === singer);
    const dataSelected = this.selectedFavArtist.find(artist => artist.key === singer);
    const dataSuggest = this.suggestfavArtist.find(artist => artist.key === singer);
    switch (whereSelected) {
      // if user use "search" for adding or removing an artist
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
      // if user use "favorite section" for removing an artist
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
      // if user use "suggest" for adding or removing an artist
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
  }

  /* This function let you search an artist */
  searchArtist($event) {
    let dataSearch: { key: string, image: any, name: string, checked: boolean };
    let dataSelected: { key: string, image: any, name: string, checked: boolean };
    let check: boolean;
    if (this.searchFavArtist.length > 0) {
      this.searchFavArtist = [];
    }
    if ($event.detail.value.length > 0) {
      if (this.shared.checkExpirationToken('expirationToken')) {
        this.alertTokenExpired();
      }
      else {
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
                  image: 'assets/img/noImgAvailable.png',
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
  }

  /* ALERT CHECK EXPIRATION TOKEN */
  async alertTokenExpired() {
    const alert = await this.alertController.create({
      header: 'Error',
      cssClass: 'alertClassError',
      message: 'Your token is expired. Click ok to refresh it!',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
          handler: () => {
            window.location.href = 'http://localhost:8100/login';
          }
        }
      ],
      backdropDismiss: true
    });
    await alert.present();
  }
}
