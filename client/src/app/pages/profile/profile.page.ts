import { ManumissionCheckService } from './../../services/manumission-check.service';
import { UserProfile } from './../../interfaces/UserProfile';
import { LogoutService } from './../../services/logout.service';
import { PreferencesServices } from '../../services/preferences.service';
import { SharedParamsService } from './../../services/shared-params.service';
import { Component } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { AlertController, LoadingController } from '@ionic/angular';
import { UserPreferences } from '../../interfaces/UserPreferences';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  // spotifyAPI
  spotifyApi = new SpotifyWebApi();

  // User variables
  userProfile: UserProfile;

  // Artists variables
  topArtistsMap = {};
  suggestfavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  searchFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  selectedFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  singerDiv = false;
  preventSearchBug = false;

  // Genres variables
  topGenresMap = [];
  genresAvailable: Array<{ key: string, checkedFav: boolean, checkedHate: boolean }> = [];
  favGenresSelected = [];
  hatedGenresSelected = [];

  // preferences changes variable
  backupselectedFavArtist: Array<{ key: string, image: any, name: string, checked: boolean }> = [];
  backupfavGenresSelected = [];
  backuphatedGenresSelected = [];
  hasChange = false;

  // html variables
  showArtist = 'Show';
  showFavoriteGenres = 'Show';
  showHatedGenres = 'Show';

  constructor(private shared: SharedParamsService, private alertController: AlertController,
    private prefService: PreferencesServices, private logoutService: LogoutService,
    private manumission: ManumissionCheckService, private loadingCtrl: LoadingController) {
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.setAccessToken(this.shared.getToken());
        this.userProfile = this.shared.getUserProfile();
        if (this.userProfile.preferences !== undefined) {
          if (this.userProfile.preferences.favoriteGenres !== undefined) {
            this.favGenresSelected = this.userProfile.preferences.favoriteGenres;
            this.backupfavGenresSelected = this.favGenresSelected.slice();
          }
          if (this.userProfile.preferences.hatedGenres !== undefined) {
            this.hatedGenresSelected = this.userProfile.preferences.hatedGenres;
            this.backuphatedGenresSelected = this.hatedGenresSelected.slice();
          }
          if (this.userProfile.preferences.favoriteSingers !== undefined) {
            if (this.userProfile.preferences.favoriteSingers.length > 0) {
              this.presentLoading('Loading data ...').then(() => {
                this.spotifyApi.getArtists(this.userProfile.preferences.favoriteSingers).then((response) => {
                  if (response !== undefined) {
                    for (const artist of response.artists) {
                      const dataArtist = {
                        key: artist.id,
                        image: artist.images[0].url,
                        name: artist.name,
                        checked: true
                      };
                      this.selectedFavArtist.push(dataArtist);
                      this.backupselectedFavArtist.push(dataArtist);
                    }
                  }
                  this.initializeGenresSeeds();
                  this.autoSearchFavGenres();
                  this.loadingCtrl.dismiss();
                });
              });
            }
            else {
              this.initializeGenresSeeds();
              this.autoSearchFavGenres();
            }
          }
          else {
            this.initializeGenresSeeds();
            this.autoSearchFavGenres();
          }
        }
        else {
          this.initializeGenresSeeds();
          this.autoSearchFavGenres();
        }
      }
    }
  }

  // Function that submit the user preferences (used for cold start)
  onClickSubmit() {
    const favArtist = [];
    for (let i = 0; i < this.selectedFavArtist.length; i++) {
      favArtist[i] = this.selectedFavArtist[i].key;
    }
    const pref: UserPreferences = {
      favoriteGenres: this.favGenresSelected,
      favoriteSingers: favArtist,
      hatedGenres: this.hatedGenresSelected
    }
    if (this.userProfile.preferences !== undefined) {
      this.prefService.updatePreferences(pref, this.userProfile.ID);
    }
    else {
      this.prefService.uploadPreferences(pref, this.userProfile.ID);
    }
    this.userProfile.preferences = pref;
    this.shared.setUserProfile(this.userProfile);
    this.hasChange = false;
  }

  // Function that search for your favorite musics' genres
  // based on your top artist's music genres
  autoSearchFavGenres() {
    const temTopGenresMap = {};
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
          if (response !== undefined) {
            for (const [index, item] of response.items.entries()) {
              // cycle on all the genres of the artist
              let checked = false;
              for (const genres of item.genres) {
                if (temTopGenresMap[genres] === undefined) {
                  temTopGenresMap[genres] = 1;
                }
                else {
                  temTopGenresMap[genres] += 1;
                }
              }
              if (index < 10) {
                if (this.userProfile.preferences !== undefined) {
                  if (this.userProfile.preferences.favoriteSingers !== undefined) {
                    for (const pref of this.userProfile.preferences.favoriteSingers) {
                      if (pref === item.id) {
                        checked = true;
                        break;
                      }
                    }
                  }
                }
                const data = {
                  key: item.id,
                  image: item.images[0].url,
                  name: item.name,
                  checked
                };
                this.suggestfavArtist.push(data);
              }
            }
            this.topGenresMap = this.sortProperties(temTopGenresMap);
          }
        }).catch(err => {
          console.log(err);
        });
      }
    }
  }

  // this function sort your top array of
  // genres" from the higher to the lower
  sortProperties(obj) {
    // convert object into array
    const sortable = [];
    for (const key in obj)
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
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.getAvailableGenreSeeds().then((response) => {
          if (response !== undefined) {
            let data: { key: string, checkedFav: boolean, checkedHate: boolean };
            for (const genres of response.genres) {
              let checkFav = false;
              let checkHate = false;
              if (this.userProfile.preferences !== undefined) {
                if (this.userProfile.preferences.favoriteGenres !== undefined) {
                  for (const favGen of this.userProfile.preferences.favoriteGenres) {
                    if (genres === favGen) {
                      checkFav = true;
                      break;
                    }
                  }
                }
                if (this.userProfile.preferences.hatedGenres !== undefined) {
                  for (const hateGen of this.userProfile.preferences.hatedGenres) {
                    if (genres === hateGen) {
                      checkHate = true;
                      break;
                    }
                  }
                }
              }
              data = {
                key: genres,
                checkedFav: checkFav,
                checkedHate: checkHate
              }
              this.genresAvailable.push(data);
            }
          }
        });
      }
    }
  }

  // This function open Div of artist preference
  showFavGenresDiv() {
    const favDiv = document.querySelector('#favDiv') as HTMLElement;
    if (favDiv.style.display !== 'block') {
      favDiv.style.display = 'block';
      this.showFavoriteGenres = 'Hide';
    }
    else {
      favDiv.style.display = 'none';
      this.showFavoriteGenres = 'Show';
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
    const dataSelected = this.genresAvailable.find(genData => genData.key === genres)
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
    this.checkChangePreferences();
  }

  checkChangePreferences() {
    if (this.backuphatedGenresSelected.length !== this.hatedGenresSelected.length) {
      this.hasChange = true;
      return;
    }
    for (let i = 0; i < this.hatedGenresSelected.length; i++) {
      if (this.backuphatedGenresSelected[i] !== this.hatedGenresSelected[i]) {
        this.hasChange = true;
        return;
      }
    }
    if (this.backupfavGenresSelected.length !== this.favGenresSelected.length) {
      this.hasChange = true;
      return;
    }
    for (let i = 0; i < this.favGenresSelected.length; i++) {
      if (this.backupfavGenresSelected[i] !== this.favGenresSelected[i]) {
        this.hasChange = true;
        return;
      }
    }
    if (this.backupselectedFavArtist.length !== this.selectedFavArtist.length) {
      this.hasChange = true;
      return;
    }
    for (let i = 0; i < this.selectedFavArtist.length; i++) {
      if (this.backupselectedFavArtist[i].key !== this.selectedFavArtist[i].key) {
        this.hasChange = true;
        return;
      }
    }
    this.hasChange = false;
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
    this.checkChangePreferences();

  }

  /* This function let you search an artist */
  searchArtist($event) {
    let dataSearch: { key: string, image: any, name: string, checked: boolean };
    let dataSelected: { key: string, image: any, name: string, checked: boolean };
    let check: boolean;
    if ($event.detail.value.length > 0) {
      if (!this.manumission.isTampered()) {
        if (this.shared.checkExpirationToken()) {
          this.alertTokenExpired();
        }
        else {
          this.spotifyApi.search($event.detail.value, ['artist'], { market: 'US', limit: 5, offset: 0 }).then((response) => {
            if (this.searchFavArtist.length > 0) {
              this.searchFavArtist = [];
            }
            if (response !== undefined) {
              for (const itemArtist of response.artists.items) {
                dataSelected = this.selectedFavArtist.find(artist => artist.key === itemArtist.id);
                if (dataSelected !== undefined) {
                  check = true;
                }
                else {
                  check = false;
                }
                if (itemArtist.images.length !== 0) {
                  dataSearch = {
                    key: itemArtist.id,
                    image: itemArtist.images[0].url,
                    name: itemArtist.name,
                    checked: check
                  };
                }
                else {
                  dataSearch = {
                    key: itemArtist.id,
                    image: 'assets/img/noImgAvailable.png',
                    name: itemArtist.name,
                    checked: check
                  };
                }
                this.searchFavArtist.push(dataSearch);
              }
            }
          });
        }
      }
    } else {
      if (this.searchFavArtist.length > 0) {
        this.searchFavArtist = [];
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

  /** ALERTS */
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

  // Loading data
  async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }
}
