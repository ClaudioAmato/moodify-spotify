import { MachineLearningService } from './machineLearning.service';
import { TrackDatas } from './../interfaces/TrackDatas';
import { Triple } from './../classes/Triple';
import { EmojisService } from './emojis.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InitializeTrainService {

  constructor(private emoji: EmojisService, private learningService: MachineLearningService) { }

  initialize() {
    const arrayEmoji = this.emoji.getArrayEmoji();
    const trackData: TrackDatas = {
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
    }
    for (const emoji of arrayEmoji) {
      const arrayTrip: Array<Triple> = [];
      for (const emoji2 of arrayEmoji) {
        const triple = new Triple();
        triple.mood = emoji2.name;
        triple.numFeedback = 1;
        triple.spotifyFeatures = trackData;
        arrayTrip.push(triple);
      }
      this.learningService.trainModel(arrayTrip, null, emoji.name);
    }
  }
}
