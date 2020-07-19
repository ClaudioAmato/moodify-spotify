import { TrackFeatures } from './../interfaces/TrackFeatures';
import { Double } from '../classes/Double';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class MachineLearningService {
  database = firebase.database();
  bufferModelLength = 10;
  bufferUserLength = 5;

  constructor(private afs: AngularFirestore) {

  }

  // This function upload or update model data mood
  trainModel(double: Double, startingMood: string) {
    this.getModelData(startingMood, double.getMood()).then((featureStored) => {
      let tempFeat: TrackFeatures;
      let tempBufFeat: TrackFeatures;
      const buff: { feat: TrackFeatures, numFeed: number } = { feat: double.spotifyFeatures, numFeed: 1 };
      if (featureStored.buff !== null && featureStored.features !== null) {
        buff.numFeed = featureStored.buff.numFeed + 1;
        tempBufFeat = this.addToBuff(double, featureStored.buff.feat);
        tempFeat = featureStored.features;
        buff.feat = tempBufFeat;
        if (buff.numFeed >= this.bufferModelLength) {
          tempFeat = this.doMean(buff.feat, this.bufferModelLength);
          buff.numFeed = 1;
          buff.feat = tempFeat;
        }
        firebase.database().ref('model/' + startingMood + '/' + double.getMood()).update({
          features: tempFeat,
          buffer: buff
        });
      }
      else {
        firebase.database().ref('model/' + startingMood + '/' + double.getMood()).set({
          features: double.spotifyFeatures,
          buffer: buff
        });
      }
    });
  }

  // This function upload or update user data mood
  uploadPersonal(double: Double, id: string, startingMood: string, changeFeedback: boolean) {
    this.getUserData(id, startingMood, double.getMood()).then((featureStored) => {
      let tempFeat: TrackFeatures;
      let tempBufFeat: TrackFeatures;
      const buff: { feat: TrackFeatures, numFeed: number } = {
        feat: double.spotifyFeatures,
        numFeed: 1
      };
      if (featureStored.features !== null && featureStored.buff !== null) {
        if (!changeFeedback) {
          buff.numFeed = featureStored.buff.numFeed + 1;
        }
        else {
          buff.numFeed = featureStored.buff.numFeed - 1;
        }
        tempBufFeat = this.addToBuff(double, featureStored.buff.feat);
        tempFeat = featureStored.features;
        buff.feat = tempBufFeat;
        if (buff.numFeed >= this.bufferUserLength) {
          tempFeat = this.doMean(buff.feat, this.bufferUserLength);
          buff.numFeed = 1;
          buff.feat = tempFeat;
        }
        if (buff.numFeed !== 0) {
          firebase.database().ref('user/' + id + '/' + startingMood + '/' + double.getMood()).update({
            features: tempFeat,
            buffer: buff
          });
        }
      }
      else {
        firebase.database().ref('user/' + id + '/' + startingMood + '/' + double.getMood()).set({
          features: double.spotifyFeatures,
          buffer: buff
        });
      }
    });
  }

  // This function return model data table
  async getModelData(startingMood: string, targetMood: string) {
    const db = firebase.database();
    const ref1 = db.ref('/model/' + startingMood + '/' + targetMood + '/features');
    const ref2 = db.ref('/model/' + startingMood + '/' + targetMood + '/buffer');

    const snapshot1 = await ref1.once('value');
    const snapshot2 = await ref2.once('value');

    const values: { features: TrackFeatures, buff: { feat: TrackFeatures, numFeed: number } } = {
      features: snapshot1.val(),
      buff: snapshot2.val()
    }

    if (values === null) {
      return undefined;
    }
    else {
      return values;
    }
  }

  // This function return user data table
  async getUserData(userID: string, startingMood: string, targetMood: string) {
    const db = firebase.database();
    const ref1 = db.ref('/user/' + userID + '/' + startingMood + '/' + targetMood + '/features');
    const ref2 = db.ref('/user/' + userID + '/' + startingMood + '/' + targetMood + '/buffer');

    const snapshot1 = await ref1.once('value');
    const snapshot2 = await ref2.once('value');

    const values: { features: TrackFeatures, buff: { feat: TrackFeatures, numFeed: number } } = {
      features: snapshot1.val(),
      buff: snapshot2.val()
    }
    if (values === null) {
      return undefined;
    }
    else {
      return values;
    }
  }

  // This function tell if user exist
  async getUser(userID: string) {
    const db = firebase.database();
    const ref = db.ref('/user/' + userID);

    const snapshot = await ref.once('value');
    const values = snapshot.val();
    if (values === null) {
      return undefined;
    }
    else {
      return values;
    }
  }

  // Round features to 3rd decimal number
  private roundTo(value, places) {
    const power = Math.pow(10, places);
    return Math.round(value * power) / power;
  }

  private doMean(buffer: TrackFeatures, bufferLen: number) {
    const MeanTrack: TrackFeatures = {
      key: Math.round(buffer.key / bufferLen),
      mode: Math.round(buffer.mode / bufferLen),
      time_signature: Math.round(buffer.time_signature / bufferLen),
      acousticness: this.roundTo((buffer.acousticness / bufferLen), 2),
      danceability: this.roundTo((buffer.danceability / bufferLen), 2),
      energy: this.roundTo((buffer.energy / bufferLen), 2),
      instrumentalness: this.roundTo((buffer.instrumentalness / bufferLen), 2),
      liveness: this.roundTo((buffer.liveness / bufferLen), 2),
      loudness: this.roundTo((buffer.loudness / bufferLen), 2),
      speechiness: this.roundTo((buffer.speechiness / bufferLen), 2),
      valence: this.roundTo((buffer.valence / bufferLen), 2),
      tempo: this.roundTo((buffer.tempo / bufferLen), 2),
      popularity: Math.round(buffer.popularity / bufferLen),
    }
    return MeanTrack;
  }

  private addToBuff(double: Double, buffFeat: TrackFeatures) {
    const Values: TrackFeatures = {
      key: (double.spotifyFeatures.key + buffFeat.key),
      mode: (double.spotifyFeatures.mode + buffFeat.mode),
      time_signature: (double.spotifyFeatures.time_signature + buffFeat.time_signature),
      acousticness: this.roundTo(((double.spotifyFeatures.acousticness + buffFeat.acousticness)), 5),
      danceability: this.roundTo(((double.spotifyFeatures.danceability + buffFeat.danceability)), 5),
      energy: this.roundTo(((double.spotifyFeatures.energy + buffFeat.energy)), 5),
      instrumentalness: this.roundTo(((double.spotifyFeatures.instrumentalness + buffFeat.instrumentalness)), 5),
      liveness: this.roundTo(((double.spotifyFeatures.liveness + buffFeat.liveness)), 5),
      loudness: this.roundTo(((double.spotifyFeatures.loudness + buffFeat.loudness)), 5),
      speechiness: this.roundTo(((double.spotifyFeatures.speechiness + buffFeat.speechiness)), 5),
      valence: this.roundTo(((double.spotifyFeatures.valence + buffFeat.valence)), 5),
      tempo: this.roundTo(((double.spotifyFeatures.tempo + buffFeat.tempo)), 5),
      popularity: (double.spotifyFeatures.popularity + buffFeat.popularity),
    }
    return Values;
  }
}