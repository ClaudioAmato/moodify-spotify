import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  splashPortrait = false;
  splashLandscape = false;
  width: number;
  height: number;
  i: number;

  constructor(private platform: Platform) {
    if (platform.is('cordova')) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      if (this.width > this.height) {
        const ratio = this.width / this.height;
        // landscape
        this.splashLandscape = true;
      } else {
        // portrait
        const ratio = this.height / this.width;
        this.splashPortrait = true;
        if (ratio < 2) {
          this.i = 1;
        } else {
          this.i = 2;
        }
      }
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.splashPortrait = false;
      this.splashLandscape = false;
    }, 4500);
  }
}
