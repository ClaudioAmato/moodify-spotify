import { UserProfile } from './../interfaces/UserProfile';
import { MachineLearningService } from '../services/machineLearning.service';
import { EmojisService } from './../services/emojis.service';
import { SharedParamsService } from './../services/shared-params.service';
import { NavController, LoadingController } from '@ionic/angular';
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

  constructor(private navCtrl: NavController, private shared: SharedParamsService,
    private emoji: EmojisService, private learningService: MachineLearningService,
    private loadingCtrl: LoadingController) {
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
    const userProfile: UserProfile = this.shared.getUserProfile();
    if (userProfile.targetFeatures === undefined) {
      this.presentLoading('Loading datas ...').then(() => {
        this.learningService.getUserData(userProfile.ID, this.shared.getCurrentMood(), this.shared.getTargetMood())
          .then(result2 => {
            if (result2 !== undefined) {
              userProfile.targetFeatures = result2.features;
              this.shared.setUserProfile(userProfile);
            }
            else {
              console.log('Moodset error');
            }
          }).then(() => {
            this.loadingCtrl.dismiss();
            this.navCtrl.navigateRoot('/moodify/home');
          });
      });
    }
    else {
      this.navCtrl.navigateRoot('/moodify/home');
    }
  }

  /* REFRESH PAGE */
  doRefresh(event) {
    window.location.reload();
    setTimeout(() => {
      event.target.complete();
    }, 5000);
  }

  // Loading data
  async presentLoading(str: string) {
    const loading = await this.loadingCtrl.create({
      message: str,
    });
    return await loading.present();
  }
}
