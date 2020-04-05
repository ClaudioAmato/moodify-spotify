import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  backButtonSubscription: any;
  disconnectSubscription: any;
  connectSubscription: any;
  public internet: boolean = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private network: Network
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleBlackOpaque();
      this.splashScreen.hide();
      setTimeout(() => {
        if (this.network.type === this.network.Connection.NONE) {
          this.internet = false;
        } else {
          this.internet = true;
        }
      }, 500);
      this.ionViewDidEnter();
    });
  }

  ionViewDidEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  ionViewWillLeave() {
    this.backButtonSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
    this.disconnectSubscription.unsubscribe();
  }
}
