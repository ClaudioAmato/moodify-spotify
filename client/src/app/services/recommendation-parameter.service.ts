import { UserProfile } from './../interfaces/UserProfile';
import { AlertController } from '@ionic/angular';
import { SharedParamsService } from './shared-params.service';
import { ManumissionCheckService } from './manumission-check.service';
import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';

@Injectable({
  providedIn: 'root'
})
export class RecommendationParameterService {

  // spotifyAPI
  spotifyApi = new SpotifyWebApi();

  // Genres variables
  genresAvailable = [];

  constructor(private manumission: ManumissionCheckService, private shared: SharedParamsService,
    private alertController: AlertController) {
    this.spotifyApi.setAccessToken(this.shared.getToken());
    this.spotifyApi.getAvailableGenreSeeds().then((response1) => {
      if (response1 !== undefined) {
        const userProfile = this.shared.getUserProfile();
        for (const genres of response1.genres) {
          if (userProfile.preferences.hatedGenres !== undefined) {
            for (const hate of userProfile.preferences.hatedGenres) {
              if (hate !== genres) {
                this.genresAvailable.push(genres);
              }
            }
          }
        }
      }
    });
  }

  getRecommendation(userProfile: UserProfile): { seed_artists: string[], seed_genres: string[] } {
    let dataRecommendation: { seed_artists: string[], seed_genres: string[] } = { seed_artists: [], seed_genres: [] };
    if (userProfile.preferences !== undefined) {
      if (userProfile.preferences.favoriteGenres !== undefined &&
        userProfile.preferences.favoriteSingers !== undefined) {
        let rand = Math.floor(Math.random() * 4) + 1;
        if (userProfile.preferences.favoriteSingers.length < userProfile.preferences.favoriteGenres.length) {
          rand = 5 - rand;
        }
        for (let i = 0; i < rand && i < userProfile.preferences.favoriteSingers.length; i++) {
          dataRecommendation.seed_artists.push(userProfile.preferences.favoriteSingers[i]);
        }
        for (let i = 0; i < (5 - rand) && i < userProfile.preferences.favoriteGenres.length; i++) {
          dataRecommendation.seed_genres.push(userProfile.preferences.favoriteGenres[i]);
        }
        return dataRecommendation;
      }
      else if (userProfile.preferences.favoriteGenres !== undefined &&
        userProfile.preferences.favoriteSingers === undefined) {
        dataRecommendation = {
          seed_artists: [],
          seed_genres: userProfile.preferences.favoriteGenres,
        }
        return dataRecommendation;
      }
      else if (userProfile.preferences.favoriteGenres === undefined &&
        userProfile.preferences.favoriteSingers !== undefined) {
        dataRecommendation = {
          seed_artists: userProfile.preferences.favoriteSingers,
          seed_genres: []
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
        const genresAvailable = [];
        const randomGenres = [];
        return await this.spotifyApi.getAvailableGenreSeeds().then((response) => {
          if (response !== undefined) {
            for (const genres of response.genres) {
              if (userProfile.preferences.hatedGenres !== undefined) {
                for (const hate of userProfile.preferences.hatedGenres) {
                  if (hate !== genres) {
                    genresAvailable.push(genres);
                  }
                }
              }
              else {
                genresAvailable.push(genres);
              }
            }
            for (let i = 0; i < 5 && i < genresAvailable.length; i++) {
              const rand = Math.floor(Math.random() * genresAvailable.length);
              randomGenres.push(genresAvailable[rand]);
              genresAvailable.splice(rand, 1);
            }
            return randomGenres;
          }
        });
      }
    } else {
      return undefined;
    }
  }

  // Function that search for your favorite musics' genres
  // based on your top artist's music genres
  async autoSearchFavGenres(userProfile) {
    const temTopGenresMap = {};
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        let topGenresMap = [];
        return await this.spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
          if (response !== undefined) {
            for (const item of response.items) {
              // cycle on all the genres of the artist
              for (const genres1 of item.genres) {
                for (const availabe of this.genresAvailable) {
                  if (this.similarity(availabe, genres1) > 0.4) {
                    if (temTopGenresMap[availabe] === undefined) {
                      temTopGenresMap[availabe] = 1;
                    }
                    else {
                      temTopGenresMap[availabe] += 1;
                    }
                  }
                }
              }
            }
            topGenresMap = this.sortProperties(temTopGenresMap);
            const genres = [];
            if (topGenresMap.length === 0) {
              return undefined;
            }
            else {
              for (let i = 0; i < 5 && i < topGenresMap.length; i++) {
                const rand = this.myRandom(topGenresMap.length);
                genres.push(topGenresMap[rand][0]);
                topGenresMap.splice(rand, 1);
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

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0)
          costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
}