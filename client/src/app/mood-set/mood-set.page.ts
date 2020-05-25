import { EmojisService } from './../services/emojis.service';
import { SharedParamsService } from './../services/shared-params.service';
import { NavController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mood-set',
  templateUrl: './mood-set.page.html',
  styleUrls: ['./mood-set.page.scss'],
})
export class MoodSetPage {
  arrayEmoji: Array<{ name: string, image: string }> = [];
  currentEmotion: string = undefined;
  targetEmotion: string = undefined;

  constructor(private navCtrl: NavController, private shared: SharedParamsService, private emoji: EmojisService) {
    this.arrayEmoji = this.emoji.getArrayEmoji();
  }

  currentState(emoji: string) {

    if (this.currentEmotion === undefined || this.currentEmotion !== emoji) {
      this.currentEmotion = emoji;
      let image: any;
      const data = this.arrayEmoji.find(currentEmotion => currentEmotion.name === this.currentEmotion);
      for (let i = 0; i < this.arrayEmoji.length; i++) {
        image = document.querySelector('#current' + i) as HTMLElement;
        if (i !== this.arrayEmoji.indexOf(data)) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
    }
  }

  targetState(emoji: string) {
    if (this.targetEmotion === undefined || this.targetEmotion !== emoji) {
      this.targetEmotion = emoji;
      let image: any;
      const data = this.arrayEmoji.find(targetEmotion => targetEmotion.name === this.targetEmotion);
      for (let i = 0; i < this.arrayEmoji.length; i++) {
        image = document.querySelector('#target' + i) as HTMLElement;
        if (i !== this.arrayEmoji.indexOf(data)) {
          image.style.filter = 'grayscale(100%) blur(1px)';
        }
        else {
          image.style.filter = 'none';
        }
      }
    }
  }

  confirmMood() {
    this.shared.setCurrentMood(this.currentEmotion);
    this.shared.setTargetMood(this.targetEmotion);
    this.navCtrl.navigateRoot('/moodify/home');
  }

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }
}
