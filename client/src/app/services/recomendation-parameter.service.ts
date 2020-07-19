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

  getRecommendation(userProfile: UserProfile, desiredFeature: TrackFeatures) {
    let dataRecommendation: any;
    if (userProfile !== undefined) {
      if (userProfile.preferences !== undefined) {
        if (userProfile.preferences.favoriteGenres !== undefined &&
          userProfile.preferences.favoriteSingers !== undefined) {
          dataRecommendation = {
            limit: 100,
            target_acousticness: desiredFeature.acousticness,
            target_key: desiredFeature.key,
            target_mode: desiredFeature.mode,
            target_time_signature: desiredFeature.time_signature,
            target_danceability: desiredFeature.danceability,
            target_energy: desiredFeature.energy,
            target_instrumentalness: desiredFeature.instrumentalness,
            target_liveness: desiredFeature.liveness,
            target_loudness: desiredFeature.loudness,
            target_speechiness: desiredFeature.speechiness,
            target_valence: desiredFeature.valence,
            target_tempo: desiredFeature.tempo,
            target_popularity: desiredFeature.popularity,
            seed_artists: userProfile.preferences.favoriteSingers,
            seed_genres: userProfile.preferences.favoriteGenres,
          }
          console.log(dataRecommendation);
          return dataRecommendation;
        }
      }
      else if (userProfile.preferences.favoriteGenres !== undefined &&
        userProfile.preferences.favoriteSingers === undefined) {
        dataRecommendation = {
          limit: 100,
          target_acousticness: desiredFeature.acousticness,
          target_key: desiredFeature.key,
          target_mode: desiredFeature.mode,
          target_time_signature: desiredFeature.time_signature,
          target_danceability: desiredFeature.danceability,
          target_energy: desiredFeature.energy,
          target_instrumentalness: desiredFeature.instrumentalness,
          target_liveness: desiredFeature.liveness,
          target_loudness: desiredFeature.loudness,
          target_speechiness: desiredFeature.speechiness,
          target_valence: desiredFeature.valence,
          target_tempo: desiredFeature.tempo,
          target_popularity: desiredFeature.popularity,
          seed_genres: userProfile.preferences.favoriteGenres,
        }
        console.log(dataRecommendation);
        return dataRecommendation;
      }
      else if (userProfile.preferences.favoriteGenres === undefined &&
        userProfile.preferences.favoriteSingers !== undefined) {
        dataRecommendation = {
          limit: 100,
          target_acousticness: desiredFeature.acousticness,
          target_key: desiredFeature.key,
          target_mode: desiredFeature.mode,
          target_time_signature: desiredFeature.time_signature,
          target_danceability: desiredFeature.danceability,
          target_energy: desiredFeature.energy,
          target_instrumentalness: desiredFeature.instrumentalness,
          target_liveness: desiredFeature.liveness,
          target_loudness: desiredFeature.loudness,
          target_speechiness: desiredFeature.speechiness,
          target_valence: desiredFeature.valence,
          target_tempo: desiredFeature.tempo,
          target_popularity: desiredFeature.popularity,
          seed_artists: userProfile.preferences.favoriteSingers,
        }
        console.log(dataRecommendation);
        return dataRecommendation;
      }
      else {
        this.autoSearchFavGenres(userProfile, desiredFeature).then((dataRecommendation2) => {
          if (dataRecommendation2 !== undefined) {
            console.log(dataRecommendation2);
            return dataRecommendation2;
          }
          else {
            if (this.topGenresMap === undefined) {
              this.generateRandomGenresSeed(userProfile, desiredFeature).then(dataRecommendation3 => {
                console.log(dataRecommendation3);
                return dataRecommendation3;
              });
            }
            else {
              const tempGen = [];
              for (let i = 0; i < 5; i++) {
                tempGen.push(this.topGenresMap[i][0])
              }
              console.log("qUI");
              return {
                limit: 100,
                target_acousticness: desiredFeature.acousticness,
                target_key: desiredFeature.key,
                target_mode: desiredFeature.mode,
                target_time_signature: desiredFeature.time_signature,
                target_danceability: desiredFeature.danceability,
                target_energy: desiredFeature.energy,
                target_instrumentalness: desiredFeature.instrumentalness,
                target_liveness: desiredFeature.liveness,
                target_loudness: desiredFeature.loudness,
                target_speechiness: desiredFeature.speechiness,
                target_valence: desiredFeature.valence,
                target_tempo: desiredFeature.tempo,
                target_popularity: desiredFeature.popularity,
                seed_genres: tempGen
              }
            }
          }
        });
      }
    }
  }

  /* FAVORITE AND HATED GENRES */
  // This function get all spotify's seed's genres available
  generateRandomGenresSeed(userProfile: UserProfile, desiredFeature: TrackFeatures) {
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.getAvailableGenreSeeds().then((response) => {
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
          }
        }).then(() => {
          for (let i = 0; i < 5; i++) {
            const rand = Math.floor(Math.random() * this.genresAvailable.length);
            this.randomGenres.push(this.genresAvailable[rand]);
            this.genresAvailable.splice(rand, 1);
          }
          return this.randomGenres;
        });
      }
    }
  }

  // Function that search for your favorite musics' genres
  // based on your top artis's music genres
  autoSearchFavGenres(userProfile: UserProfile, desiredFeature: TrackFeatures) {
    const temTopGenresMap = {};
    if (!this.manumission.isTampered()) {
      if (this.shared.checkExpirationToken()) {
        this.alertTokenExpired();
      }
      else {
        this.spotifyApi.getMyTopArtists({ limit: 50, time_range: 'long_term' }).then((response) => {
          if (response !== undefined) {
            for (const item of response.items) {
              // cycle on all the genres of the artist
              for (const genres of item.genres) {
                if (temTopGenresMap[genres] === undefined) {
                  temTopGenresMap[genres] = 1;
                }
                else {
                  temTopGenresMap[genres] += 1;
                }
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