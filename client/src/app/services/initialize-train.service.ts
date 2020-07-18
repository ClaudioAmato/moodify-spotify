import { LoadingController } from '@ionic/angular';
import { MachineLearningService } from './machineLearning.service';
import { TrackFeatures } from '../interfaces/TrackFeatures';
import { Double } from '../classes/Double';
import { EmojisService } from './emojis.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InitializeTrainService {

  constructor(private emoji: EmojisService, private learningService: MachineLearningService,
    private loadingCtrl: LoadingController) { }

  initialize() {
    const arrayEmoji = this.emoji.getArrayEmoji();
    const trackData: TrackFeatures = {
      key: 5,
      mode: 0,
      time_signature: 4,
      acousticness: 0.5,
      danceability: 0.5,
      energy: 0.5,
      instrumentalness: 0.5,
      liveness: 0.5,
      loudness: -30,
      speechiness: 0.5,
      valence: 0.5,
      tempo: 120,
      popularity: 50
    }
    this.presentLoading('Loading datas ...').then(() => {
      for (const emoji of arrayEmoji) {
        for (const emoji2 of arrayEmoji) {
          const double = new Double();
          double.mood = emoji2.name;
          double.spotifyFeatures = trackData;
          this.learningService.trainModel(double, emoji.name);
        }
      }
    }).then(() => {
      this.loadingCtrl.dismiss();
    });
  }

  // Loading data
  private async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }
}
