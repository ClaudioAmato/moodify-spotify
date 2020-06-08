import { LogoutService } from './../services/logout.service';
import { PreferencesServices } from '../services/preferences.service';
import { SharedParamsService } from './../services/shared-params.service';
import { Component, OnInit } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  // spotifyAPI
  spotifyApi = new SpotifyWebApi();

  // User varialbes
  userProfilePhoto: any;
  email: string;
  name: string;
  country: string;
  url: string;
  id: string;

  // Artists variables
  topArtistsMap = {};
  suggestfavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  searchFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  selectedFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  singerDiv = false;
  preventSearchBug = false;

  // Genres variables
  topGenresMap = {};
  genresAvailable: Array<{ key: string, checkedFav: boolean, checkedHate: boolean }> = [];
  favGenresSelected = [];
  hatedGenresSelected = [];

  // html variables
  showArtist = 'Show';
  showFavoritGenres = 'Show';
  showHatedGenres = 'Show';

  // User prefereces
  waitUserPreferences = true;
  initUserPref = false;
  userExist = false;

  constructor(private shared: SharedParamsService, private alertController: AlertController,
    private prefService: PreferencesServices, private logoutService: LogoutService) {
  }

  ngOnInit() {
    if (this.shared.checkExpirationToken()) {
      this.alertTokenExpired();
    }
    else {
      this.spotifyApi.setAccessToken(this.shared.getToken());
      this.spotifyApi.getMe().then((response) => {
        this.userProfilePhoto = response.images[0].url;
        if (this.userProfilePhoto === undefined) {
          this.userProfilePhoto = 'assets/img/noImgAvailable.png';
        }
        this.email = response.email;
        this.name = response.display_name;
        this.country = response.country;
        this.url = response.external_urls.spotify;
      });
      this.autoSearchFavGenres();
    }
    this.prefService.getAllUsersPreference().subscribe(data => {
      let i;
      for (i = 0; i < data.length; i++) {
        if (data[i].email === this.email) {
          this.favGenresSelected = data[i].favoriteGenres;
          this.hatedGenresSelected = data[i].hatedGenres;
          this.shared.setFavGenres(this.favGenresSelected);
          this.shared.setHatedGenres(this.hatedGenresSelected);
          this.shared.setFavSinger(data[i].favoriteSingers);
          this.spotifyApi.getArtists(data[i].favoriteSingers).then((response) => {
            if (response !== undefined) {
              for (i = 0; i < response.artists.length; i++) {
                let data = {
                  key: response.artists[i].id,
                  image: response.artists[i].images[0].url,
                  name: response.artists[i].name,
                  checked: true
                };
                this.selectedFavArtist.push(data);
              }
            }
          });
          this.userExist = true;
          break;
        }
      }
      this.initializeGenresSeeds();
    });
  }


  // Function that submit the user preferences (used for cold start)
  onClickSubmit() {
    if (this.waitUserPreferences) {
      if (!this.userExist) {
        this.alertAddPreferences('Add preferences', 'Do you want to add this preferences?');
      }
      else {
        this.alertDenied('Denied!', 'You can\'t update your preferences');
      }
    }
    else {
      let favArist = [];
      for (let i = 0; i < this.selectedFavArtist.length; i++) {
        favArist[i] = this.selectedFavArtist[i].key;
      }
      if ((this.favGenresSelected.length > 0 && this.hatedGenresSelected.length > 0) ||
        favArist.length > 0) {
        const addUserFirebaseData = {
          email: this.email,
          favoriteGenres: this.favGenresSelected,
          favoriteSingers: favArist,
          hatedGenres: this.hatedGenresSelected
        }
        this.prefService.addUserPreferences(addUserFirebaseData).then(() => {
          this.alertSuccess('Success', 'Your preferences has been added');
          this.shared.setFavGenres(this.favGenresSelected);
          this.shared.setHatedGenres(this.hatedGenresSelected);
          this.shared.setFavSinger(favArist);
          this.waitUserPreferences = true;
          this.userExist = true;
        });
      }
    }
  }

  // Function that search for your favorite musics' genres
  // based on your top artis's music genres
  autoSearchFavGenres() {
    if (this.shared.checkExpirationToken()) {
      this.alertTokenExpired();
    }
    else {
      this.spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
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
    if (this.shared.checkExpirationToken()) {
      this.alertTokenExpired();
    }
    else {
      this.spotifyApi.getAvailableGenreSeeds().then((response) => {
        if (response !== undefined) {
          let data: { key: string, checkedFav: boolean, checkedHate: boolean };
          for (let i = 0; i < response.genres.length; i++) {
            let checkFav = false;
            let checkHate = false;
            if (this.shared.getFavGenres() !== null) {
              for (let j = 0; j < this.shared.getFavGenres().length; j++) {
                if (response.genres[i] === this.shared.getFavGenres()[j]) {
                  checkFav = true;
                  break;
                }
              }
            }
            if (this.shared.getHatedGenres() !== null) {
              for (let j = 0; j < this.shared.getHatedGenres().length; j++) {
                if (response.genres[i] === this.shared.getHatedGenres()[j]) {
                  checkHate = true;
                  break;
                }
              }
            }
            data = {
              key: response.genres[i],
              checkedFav: checkFav,
              checkedHate: checkHate
            }
            this.genresAvailable.push(data);
          }
        }
      })
      if (this.initUserPref) {
        this.initializePreferences();
        this.initUserPref = false;
      };
    }
  }

  // This function initialize user preferences if he/she had
  // previously choosen them
  initializePreferences() {
    this.favGenresSelected = this.shared.getFavGenres();
    this.hatedGenresSelected = this.shared.getHatedGenres();
  }

  // This function open Div of artist preference
  showFavGenresDiv() {
    const favDiv = document.querySelector('#favDiv') as HTMLElement;
    if (favDiv.style.display !== 'block') {
      favDiv.style.display = 'block';
      this.showFavoritGenres = 'Hide';
    }
    else {
      favDiv.style.display = 'none';
      this.showFavoritGenres = 'Show';
    }
  }

  // This function open Div of artist preference
  showHatedGenresDiv() {
    const hatedDiv = document.querySelector('#hateDiv') as HTMLElement;
    if (hatedDiv.style.display !== 'block') {
      hatedDiv.style.display = 'block';
      this.showHatedGenres = 'Hide';
    }
    else {
      hatedDiv.style.display = 'none';
      this.showHatedGenres = 'Show';
    }
  }

  // this function update the genres' preferences of the user
  updateGenresPref(whereSelected, genres) {
    let dataSelected = this.genresAvailable.find(genData => genData.key === genres);

    switch (whereSelected) {
      // if user use "favorite" for adding or removing a genres preference
      case 'favorite':
        if (dataSelected !== undefined) {
          dataSelected.checkedFav = !dataSelected.checkedFav;
          if (dataSelected.checkedFav) {
            this.favGenresSelected.push(dataSelected.key);
          }
          else {
            this.favGenresSelected.splice(this.favGenresSelected.indexOf(dataSelected.key), 1);
          }
        }
        break;
      // if user use "hated" for adding or removing a genres preference
      case 'hated':
        if (dataSelected !== undefined) {
          dataSelected.checkedHate = !dataSelected.checkedHate;
          if (dataSelected.checkedHate) {
            this.hatedGenresSelected.push(dataSelected.key);
          }
          else {
            this.hatedGenresSelected.splice(this.hatedGenresSelected.indexOf(dataSelected.key), 1);
          }
        }
        break;
      default: break;
    }

  }

  /* SINGER PREFERENCES */
  // This function open Div of artist preference
  showSingerPref() {
    this.singerDiv = !this.singerDiv;
    if (!this.singerDiv) {
      this.clearSearch();
    }
    this.showArtist = this.singerDiv === false ? 'Show' : 'Hide';
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
            // I add it to
            if (dataSelected === undefined) {
              this.selectedFavArtist.push(newDataSearch);
              if (dataSuggest !== undefined) {
                this.suggestfavArtist[this.suggestfavArtist.indexOf(dataSuggest)].checked = true;
              }
            }
            // I delete it
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
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.search($event.detail.value, ['artist'], { market: 'US', limit: 5, offset: 0 }).then((response) => {
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

  // clear searchbar
  clearSearch() {
    if (this.searchFavArtist.length > 0) {
      this.searchFavArtist = [];
    }
  }

  // Logout form the website
  logout() {
    this.logoutService.logout();
  }

  /** ALERTS */
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
            if (window.location.href.includes('localhost')) {
              window.location.href = 'http://localhost:8888/login';
            }
            else {
              window.location.href = 'https://moodify-spotify-server.herokuapp.com/login';
            }
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  /* ALERT LOGOUT */
  async alertLogout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      cssClass: 'alertClassWarning',
      message: 'Are you sure to logout?',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertMedium',
          handler: () => {
            this.logout();
          }
        },
        {
          text: 'Cancel',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();
  }

  /* ALERT LOGOUT */
  async alertAddPreferences(head: string, text: string) {
    const alert = await this.alertController.create({
      header: head,
      cssClass: 'alertClassPrimary',
      message: text,
      buttons: [
        {
          text: 'Yes',
          cssClass: 'alertConfirm',
          handler: () => {
            this.waitUserPreferences = false;
            this.onClickSubmit();
          }
        },
        {
          text: 'No',
          cssClass: 'alertMedium',
        }
      ],
    });
    await alert.present();
  }

  /* ALERT LOGOUT */
  async alertDenied(head: string, text: string) {
    const alert = await this.alertController.create({
      header: head,
      cssClass: 'alertClassDanger',
      message: text,
      buttons: [
        {
          text: 'Ok',
          cssClass: 'alertConfirm'
        }
      ],
    });
    await alert.present();

    // timeout di 2 secondi per l'alert
    setTimeout(() => {
      alert.dismiss();
    }, 2000);
  }

  /* ALERT SUCCESS */
  async alertSuccess(head: string, text: string) {
    const alert = await this.alertController.create({
      header: head,
      cssClass: 'alertClassSuccess',
      message: text,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
          handler: () => {
            window.location.reload();
          }
        }
      ],
    });
    await alert.present();

    // timeout di 2 secondi per l'alert
    setTimeout(() => {
      alert.dismiss();
    }, 10000);
  }

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }
}
