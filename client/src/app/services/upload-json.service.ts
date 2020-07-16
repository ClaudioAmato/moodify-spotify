import { TrackDatas } from './../interfaces/TrackDatas';
import { Triple } from '../classes/Triple';
import { LoadingController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { JsonData } from '../interfaces/JsonData';
import * as firebase from 'firebase/app';
import 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class UploadJSONService {
  database = firebase.database();

  constructor(private afs: AngularFirestore, private loadingCtrl: LoadingController,
    private alertController: AlertController) {

  }

  trainModel(triple: Array<Triple>, userID: string, startingMood: string) {
    this.presentLoading('Loading datas ...').then(() => {
      for (const [index, item] of triple.entries()) {
        this.getModelData(startingMood, item.getMood()).then((featureStored) => {
          if (featureStored !== undefined) {
            item.spotifyFeatures = {
              key: Math.round((item.spotifyFeatures.key + featureStored.key) / 2),
              mode: Math.round((item.spotifyFeatures.mode + featureStored.mode) / 2),
              time_signature: Math.round((item.spotifyFeatures.time_signature + featureStored.time_signature) / 2),
              acousticness: this.roundTo(((item.spotifyFeatures.acousticness + featureStored.acousticness) / 2), 2),
              danceability: this.roundTo(((item.spotifyFeatures.danceability + featureStored.danceability) / 2), 2),
              energy: this.roundTo(((item.spotifyFeatures.energy + featureStored.energy) / 2), 2),
              instrumentalness: this.roundTo(((item.spotifyFeatures.instrumentalness + featureStored.instrumentalness) / 2), 2),
              liveness: this.roundTo(((item.spotifyFeatures.liveness + featureStored.liveness) / 2), 2),
              loudness: this.roundTo(((item.spotifyFeatures.loudness + featureStored.loudness) / 2), 2),
              speechiness: this.roundTo(((item.spotifyFeatures.speechiness + featureStored.speechiness) / 2), 2),
              valence: this.roundTo(((item.spotifyFeatures.valence + featureStored.valence) / 2), 2),
              tempo: this.roundTo(((item.spotifyFeatures.tempo + featureStored.tempo) / 2), 2),
            }
            firebase.database().ref('model/' + startingMood + '/' + item.getMood()).update({
              features: item.getSpotifyFeatures()
            }).catch(() => {
              this.loadingCtrl.dismiss();
            });
          }
          else {
            firebase.database().ref('model/' + startingMood + '/' + item.getMood()).set({
              features: item.getSpotifyFeatures()
            }).catch(() => {
              this.loadingCtrl.dismiss();
            });
          }
        }).then(() => {
          if (index === triple.length - 1) {
            this.uploadPersonal(triple, userID, startingMood);
            this.loadingCtrl.dismiss();
          }
        });
      }
    });
  }

  uploadPersonal(triple: Array<Triple>, id: string, startingMood: string) {
    let whatchadoin = 'upload';
    this.presentLoading('Loading datas ...').then(() => {
      for (const [index, item] of triple.entries()) {
        this.getUserData(id, startingMood, item.getMood()).then((featureStored) => {
          if (featureStored !== undefined) {
            whatchadoin = 'update';
            item.spotifyFeatures = {
              key: Math.round((item.spotifyFeatures.key + featureStored.key) / 2),
              mode: Math.round((item.spotifyFeatures.mode + featureStored.mode) / 2),
              time_signature: Math.round((item.spotifyFeatures.time_signature + featureStored.time_signature) / 2),
              acousticness: this.roundTo(((item.spotifyFeatures.acousticness + featureStored.acousticness) / 2), 2),
              danceability: this.roundTo(((item.spotifyFeatures.danceability + featureStored.danceability) / 2), 2),
              energy: this.roundTo(((item.spotifyFeatures.energy + featureStored.energy) / 2), 2),
              instrumentalness: this.roundTo(((item.spotifyFeatures.instrumentalness + featureStored.instrumentalness) / 2), 2),
              liveness: this.roundTo(((item.spotifyFeatures.liveness + featureStored.liveness) / 2), 2),
              loudness: this.roundTo(((item.spotifyFeatures.loudness + featureStored.loudness) / 2), 2),
              speechiness: this.roundTo(((item.spotifyFeatures.speechiness + featureStored.speechiness) / 2), 2),
              valence: this.roundTo(((item.spotifyFeatures.valence + featureStored.valence) / 2), 2),
              tempo: this.roundTo(((item.spotifyFeatures.tempo + featureStored.tempo) / 2), 2),
            }
            firebase.database().ref('user/' + id + '/' + startingMood + '/' + item.getMood()).update({
              features: item.getSpotifyFeatures()
            }).catch(() => {
              this.loadingCtrl.dismiss();
              this.alertSuccess('Error', 'Your session has not been updated', 'alertClassError');
            });
          }
          else {
            firebase.database().ref('user/' + id + '/' + startingMood + '/' + item.getMood()).set({
              features: item.getSpotifyFeatures()
            }).catch(() => {
              this.loadingCtrl.dismiss();
              this.alertSuccess('Error', 'Your session has not been uploaded', 'alertClassError');
            });
          }
        }).then(() => {
          if (index === triple.length - 1) {
            this.loadingCtrl.dismiss();
            if (whatchadoin === 'upload') {
              this.alertSuccess('Session uploaded', 'Your session has been uploaded', 'alertClassSuccess');
            }
            else if (whatchadoin === 'update') {
              this.alertSuccess('Session updated', 'Your session has been updated', 'alertClassSuccess');
            }
          }
        });
      }
    });
  }

  async getUserData(userID: string, startingMood: string, targetMood: string) {
    const db = firebase.database()
    const ref = db.ref('/user/' + userID + '/' + startingMood + '/' + targetMood + '/features')

    const snapshot = await ref.once('value');
    const values: TrackDatas = snapshot.val();
    if (values === null) {
      return undefined;
    }
    else {
      return values;
    }
  }

  async getModelData(startingMood: string, targetMood: string) {
    const db = firebase.database()
    const ref = db.ref('/model/' + startingMood + '/' + targetMood + '/features')

    const snapshot = await ref.once('value');
    const values: TrackDatas = snapshot.val();
    if (values === null) {
      return undefined;
    }
    else {
      return values;
    }
  }

  // Round features to 3rd decimal number
  roundTo(value, places) {
    const power = Math.pow(10, places);
    return Math.round(value * power) / power;
  }

  // Loading data
  private async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }

  /* ALERT SUCCESS */
  private async alertSuccess(head: string, text: string, classeCSS: string) {
    const alert = await this.alertController.create({
      header: head,
      cssClass: classeCSS,
      message: text,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();

    // timeout di 2 secondi per l'alert
    setTimeout(() => {
      alert.dismiss();
    }, 10000);
  }
}