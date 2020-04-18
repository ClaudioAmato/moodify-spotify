import { NavController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mood-set',
  templateUrl: './mood-set.page.html',
  styleUrls: ['./mood-set.page.scss'],
})
export class MoodSetPage {
  navCtrl: any;
  constructor(private navigationController: NavController) {
    this.navCtrl = navigationController;
  }


  confirmMood() {
    this.navCtrl.navigateRoot('/moodify/home');
  }
}
