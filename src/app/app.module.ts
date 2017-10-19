import { SuperadminPage } from '../pages/superadmin/superadmin';
import { AdminmanagerPage } from '../pages/adminmanager/adminmanager';
import { RegisteredadminPage } from '../pages/registeredadmin/registeredadmin';
import { RequestadminPage } from '../pages/requestadmin/requestadmin';
import { RegisterPage } from '../pages/register/register';
import { LoginPage } from '../pages/login/login';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MaxLengthDirective } from '../directives/c-maxlength/c-maxlength';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { FIREBASE_CONFIG } from "./app.firebase.config";
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    SuperadminPage,
    AdminmanagerPage,
    RegisteredadminPage,
    RequestadminPage,
    MaxLengthDirective
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpModule,
    NgxQRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    SuperadminPage,
    AdminmanagerPage,
    RegisteredadminPage,
    RequestadminPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireDatabaseModule,
    AngularFireAuth,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider,
    AngularFireAuth,
    BarcodeScanner
  ]
})
export class AppModule {}
