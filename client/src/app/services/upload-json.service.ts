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

  uploadSession(UserData: JsonData, id: string, date: string, startingMood: string, targetMood: string) {
    this.presentLoading('Loading datas ...').then(() => {
      firebase.database().ref('users/' + id + '/' + date + '/' + startingMood + '/' + targetMood).set({
        triples: UserData.triples
      }).then(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Session uploaded', 'Your session has been uploaded', 'alertClassSuccess');
      }).catch(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Error', 'Your session has not been uploaded', 'alertClassDanger');
      });
    });
  }

  async getUserSession(userID: string, date: string, startingMood: string, targetMood: string) {
    let user: JsonData;
    const db = firebase.database()
    const ref = db.ref('/users/' + userID + '/' + date + '/' + startingMood + '/' + targetMood)

    const snapshot = await ref.once('value');
    const values = snapshot.val();
    if (values === null) {
      return undefined;
    }
    else {
      user = {
        triples: values.triples,
      };
      return user;
    }
  }

  updateSession(UserData: JsonData, id: string, date: string, startingMood: string, targetMood: string) {
    this.presentLoading('Loading datas ...').then(() => {
      firebase.database().ref('users/' + id + '/' + date + '/' + startingMood + '/' + targetMood).update({
        triples: UserData.triples
      }).then(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Session updated', 'Your session has been updated', 'alertClassSuccess');
      }).catch(() => {
        this.loadingCtrl.dismiss();
        this.alertSuccess('Error', 'Your session has not been updated', 'alertClassDanger');
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