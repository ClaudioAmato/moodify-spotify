import { AlertController } from '@ionic/angular';
import { SharedParamsService } from './shared-params.service';
import { ManumissionCheckService } from './manumission-check.service';
import { TrackFeatures } from './../interfaces/TrackFeatures';
import { UserProfile } from './../interfaces/UserProfile';
import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

@Injectable({
  providedIn: 'root'
})
export class RecomendationParameterService {

  // spotifyAPI
  spotifyApi = new SpotifyWebApi();

  // Genres variables
  topGenresMap = [];
  genresAvailable = [];
  randomGenres = [];

  constructor(private manumission: ManumissionCheckService, private shared: SharedParamsService,
    private alertController: AlertController) { }

  getRecommendation(userProfile: UserProfile): { seed_artists: string[], seed_genres: string[] } {
    let dataRecommendation: { seed_artists: string[], seed_genres: string[] };
    if (userProfile.preferences !== undefined) {
      if (userProfile.preferences.favoriteGenres !== undefined &&
        userProfile.preferences.favoriteSingers !== undefined) {
        dataRecommendation = {
          seed_artists: userProfile.preferences.favoriteSingers,
          seed_genres: userProfile.preferences.favoriteGenres,
        }
        return dataRecommendation;
      }
      else if (userProfile.preferences.favoriteGenres !== undefined &&
        userProfile.preferences.favoriteSingers === undefined) {
        dataRecommendation = {
          seed_artists: undefined,
          seed_genres: userProfile.preferences.favoriteGenres,
        }
        return dataRecommendation;
      }
      else if (userProfile.preferences.favoriteGenres === undefined &&
        userProfile.preferences.favoriteSingers !== undefined) {
        dataRecommendation = {
          seed_artists: userProfile.preferences.favoriteSingers,
          seed_genres: undefined
        }
        return dataRecommendation;
      }
      else {
        return undefined;
      }
    }
  }


  /* FAVORITE AND HATED GENRES */
  // This function get all spotify's seed's genres available
  async generateRandomGenresSeed(userProfile: UserProfile) {
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
        return undefined;
      }
      else {
        return await this.spotifyApi.getAvailableGenreSeeds().then((response) => {
          if (response !== undefined) {
            for (const genres of response.genres) {
              if (userProfile.preferences.hatedGenres !== undefined) {
                for (const hate of userProfile.preferences.hatedGenres) {
                  if (hate !== genres) {
                    this.genresAvailable.push(genres);
                  }
                }
              }
              else {
                this.genresAvailable.push(genres);
              }
            }
            for (let i = 0; i < 5 && i < this.genresAvailable.length; i++) {
              const rand = Math.floor(Math.random() * this.genresAvailable.length);
              this.randomGenres.push(this.genresAvailable[rand]);
              this.genresAvailable.splice(rand, 1);
            }
            return this.randomGenres;
          }
        });
      }
    } else {
      return undefined;
    }
  }

  // Function that search for your favorite musics' genres
  // based on your top artis's music genres
  async autoSearchFavGenres() {
    const temTopGenresMap = {};
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        return await this.spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
          if (response !== undefined) {
            for (const item of response.items) {
              // cycle on all the genres of the artist
              for (const genres1 of item.genres) {
                if (temTopGenresMap[genres1] === undefined) {
                  temTopGenresMap[genres1] = 1;
                }
                else {
                  temTopGenresMap[genres1] += 1;
                }
              }
            }
            this.topGenresMap = this.sortProperties(temTopGenresMap);
            const genres = [];
            if (this.topGenresMap.length === 0) {
              return undefined;
            }
            else {
              for (let i = 0; i < 5 && i < this.topGenresMap.length; i++) {
                const rand = this.myRandom(this.topGenresMap.length);
                genres.push(this.topGenresMap[rand][0]);
                this.topGenresMap.splice(rand, 1);
              }
            }
            return genres;
          }
        }).catch(err => {
          console.log(err);
        });
      }
    }
  }

  // this function return va
  myRandom(maxLen: number) {
    const rnd = Math.random(), rnd2 = Math.random();
    const first = Math.floor(maxLen / 10), second = Math.floor(maxLen / 2);
    let x: number;
    if (rnd < 0.75) {
      x = Math.floor(rnd2 * first);
      return (x);
    }
    else if (rnd < 0.9) {
      x = Math.floor(rnd2 * (second - first) + first);
      return (x);
    }
    else {
      x = Math.floor(rnd2 * (maxLen - second) + second);
      return (x);
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
    await alert.present
  }
}