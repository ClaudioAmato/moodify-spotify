import { keyTargetMood, keyCurrentMood } from './../../environments/environment';
import { SharedParamsService } from './../services/shared-params.service';
import { NavController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mood-set',
  templateUrl: './mood-set.page.html',
  styleUrls: ['./mood-set.page.scss'],
})
export class MoodSetPage {
  amusedImg = 'assets/emoji/amused.png';
  angryImg = 'assets/emoji/angry.png';
  anxiousImg = 'assets/emoji/anxious.png';
  calmImg = 'assets/emoji/calm.png';
  cryImg = 'assets/emoji/cry.png';
  energyImg = 'assets/emoji/energy.png';
  happyImg = 'assets/emoji/happy.png';
  sensualImg = 'assets/emoji/sensual.png';

  arrayEmoji = [
    this.amusedImg,
    this.angryImg,
    this.anxiousImg,
    this.calmImg,
    this.cryImg,
    this.energyImg,
    this.happyImg,
    this.sensualImg
  ]
  currentEmotion: string = undefined;
  targetEmotion: string = undefined;

  constructor(private navCtrl: NavController, private shared: SharedParamsService) {
  }

  currentState(emoji: string) {
    if (this.currentEmotion === undefined || this.currentEmotion !== emoji) {
      this.currentEmotion = emoji;
      let image: any;
      for (let i = 0; i < this.arrayEmoji.length; i++) {
        image = document.querySelector('#current' + i) as HTMLElement;
        if (this.arrayEmoji[i] !== this.currentEmotion) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
      switch (emoji) {
        case this.amusedImg:
          console.log('amused');
          break;
        case this.angryImg:
          console.log('angry');
          break;
        case this.anxiousImg:
          console.log('anxious');
          break;
        case this.calmImg:
          console.log('calm');
          break;
        case this.cryImg:
          console.log('cry');
          break;
        case this.energyImg:
          console.log('energy');
          break;
        case this.happyImg:
          console.log('happy');
          break;
        case this.sensualImg:
          console.log('sensual');
          break;
        default:
          break;
      }
    }
  }

  targetState(emoji: string) {
    if (this.targetEmotion === undefined || this.targetEmotion !== emoji) {
      this.targetEmotion = emoji;
      let image: any;
      for (let i = 0; i < this.arrayEmoji.length; i++) {
        image = document.querySelector('#target' + i) as HTMLElement;
        if (this.arrayEmoji[i] !== this.targetEmotion) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
      switch (emoji) {
        case this.amusedImg:
          console.log('amused');
          break;
        case this.angryImg:
          console.log('angry');
          break;
        case this.anxiousImg:
          console.log('anxious');
          break;
        case this.calmImg:
          console.log('calm');
          break;
        case this.cryImg:
          console.log('cry');
          break;
        case this.energyImg:
          console.log('energy');
          break;
        case this.happyImg:
          console.log('happy');
          break;
        case this.sensualImg:
          console.log('sensual');
          break;
        default:
          break;
      }
    }
  }

  confirmMood() {
    const index1 = this.currentEmotion.indexOf('/', this.currentEmotion.indexOf('/') + 1) + 1;
    const index2 = this.targetEmotion.indexOf('/', this.targetEmotion.indexOf('/') + 1) + 1;

    this.shared.setCurrentMood(keyCurrentMood, this.currentEmotion.substring(
      index1,
      this.currentEmotion.length - 4)
    );

    this.shared.setTargetMood(keyTargetMood, this.targetEmotion.substring(
      index2,
      this.targetEmotion.length - 4)
    );
    this.navCtrl.navigateRoot('/moodify/home');
  }
}
