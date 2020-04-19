import { NavController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mood-set',
  templateUrl: './mood-set.page.html',
  styleUrls: ['./mood-set.page.scss'],
})
export class MoodSetPage {

  constructor(private navCtrl: NavController) { }

  confirmMood() {
    this.navCtrl.navigateRoot('/moodify/home');
  }
}
