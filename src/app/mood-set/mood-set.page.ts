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
  currentEmotion: any = undefined;
  targetEmotion: any = undefined;

  constructor(private navCtrl: NavController) {
  }

  currentState(emoji: string) {
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

  targetState(emoji: string) {
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

  confirmMood() {
    this.navCtrl.navigateRoot('/moodify/home');
  }
}
