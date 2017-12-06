// import { AdminmanagerPage } from '../pages/adminmanager/adminmanager';
// import { SuperadminPage } from '../pages/superadmin/superadmin';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SenderPage } from '../pages/sender/sender';
import { SuperadminPage } from '../pages/superadmin/superadmin';
import { LoginPage } from '../pages/login/login';
import { Storage } from '@ionic/storage';
import { IonicPage, Nav, NavParams } from 'ionic-angular';
import { Inject, ViewChild } from '@angular/core';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;
  @ViewChild(Nav) nav: Nav;
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, storage: Storage) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      storage.get('currentUser').then((val) => {
        console.log('User data ', val);
        if(val){
          if(val.role == 3){
            this.nav.push(SuperadminPage, {
              user: val
            });
          }else{
            this.nav.push(SenderPage, {
              user: val
            });
          }
        }
      })
    });
  }
}

