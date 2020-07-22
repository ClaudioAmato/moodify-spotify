import { UserPreferences } from './../interfaces/UserPreferences';
import { LoadingController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class PreferencesServices {
  database = firebase.database();

  constructor(private afs: AngularFirestore, private loadingCtrl: LoadingController,
    private alertController: AlertController) {

  }

  uploadPreferences(userPreferences: UserPreferences, id: string) {
    this.presentLoading('Loading data ...').then(() => {
      firebase.database().ref('preferences/' + id).set({
        favoriteGenres: userPreferences.favoriteGenres,
        hatedGenres: userPreferences.hatedGenres,
        favoriteSingers: userPreferences.favoriteSingers
      }).then(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Preferences uploaded', 'Your preferences has been uploaded', 'alertClassPrimary');
      }).catch(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Error', 'Your preferences has not been uploaded', 'alertClassError');
      });
    });
  }

  async getUserPreferences(userID: string) {
    let pref: UserPreferences;
    const db = firebase.database()
    const ref = db.ref('/preferences/' + userID)

    const snapshot = await ref.once('value');
    const values = snapshot.val();
    if (values === null) {
      return undefined;
    }
    else {
      pref = {
        favoriteGenres: values.favoriteGenres,
        hatedGenres: values.hatedGenres,
        favoriteSingers: values.favoriteSingers
      };
      return pref;
    }
  }

  updatePreferences(userPreferences: UserPreferences, id: string) {
    this.presentLoading('Loading data ...').then(() => {
      firebase.database().ref('preferences/' + id).update({
        favoriteGenres: userPreferences.favoriteGenres,
        hatedGenres: userPreferences.hatedGenres,
        favoriteSingers: userPreferences.favoriteSingers
      }).then(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Preferences uploaded', 'Your preferences has been uploaded', 'alertClassPrimary');
      }).catch(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Error', 'Your preferences has not been uploaded', 'alertClassError');
      });
    });
  }

  // Loading data
  private async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }

  /* ALERT SUCCESS */
  private async alertSuccess(head: string, text: string, classCSS: string) {
    const alert = await this.alertController.create({
      header: head,
      cssClass: classCSS,
      message: text,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alertConfirm',
        }
      ],
    });
    await alert.present();

    // timeout of 2 seconds for the alert
    setTimeout(() => {
      alert.dismiss();
    }, 10000);
  }
}
