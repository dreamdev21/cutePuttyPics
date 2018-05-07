import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { MyApp } from './app.component';
import { TransactionDetailPage } from '../pages/transaction-detail/transaction-detail';
import { AllTransactionsPage } from '../pages/all-transactions/all-transactions';
import { PendingTransactionsPage } from '../pages/pending-transactions/pending-transactions';
import { CashOutPage } from '../pages/cash-out/cash-out';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { VerifyQRcodePage} from '../pages/verify-q-rcode/verify-q-rcode'
import { SettingsPage } from '../pages/settings/settings';
import { VerifypaypalPage} from '../pages/verifypaypal/verifypaypal';
import { ReportPage } from '../pages/report/report';
import { ReceivemoneyPage } from '../pages/receivemoney/receivemoney';
import { SendmoneyPage } from '../pages/sendmoney/sendmoney';
import { SenderPage } from '../pages/sender//sender';
import { SuperadminPage } from '../pages/superadmin/superadmin';
import { AdminmanagerPage } from '../pages/adminmanager/adminmanager';
import { RegisteredadminPage } from '../pages/registeredadmin/registeredadmin';
import { RequestadminPage } from '../pages/requestadmin/requestadmin';
import { RegisterPage } from '../pages/register/register';
import { LoginPage } from '../pages/login/login';

import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { PayPal } from '@ionic-native/paypal';
import { FilePath } from '@ionic-native/file-path';
import { Transfer } from '@ionic-native/transfer';

import { MaxLengthDirective } from '../directives/c-maxlength/c-maxlength';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { FIREBASE_CONFIG } from './app.firebase.config';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { CurrencyPipe } from '@angular/common';

@NgModule({
  declarations: [
    MyApp,
    TransactionDetailPage, 
    AllTransactionsPage,
    PendingTransactionsPage,
    CashOutPage,
    ResetPasswordPage,
    ForgotPasswordPage,
    VerifypaypalPage,
    VerifyQRcodePage,
    SettingsPage,
    ReportPage,
    ReceivemoneyPage,
    SenderPage,
    SendmoneyPage,
    SuperadminPage,
    AdminmanagerPage,
    RegisteredadminPage,
    RequestadminPage,
    LoginPage,
    RegisterPage,
    MaxLengthDirective,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpModule,
    NgxQRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TransactionDetailPage, 
    AllTransactionsPage,
    PendingTransactionsPage,
    CashOutPage,
    ResetPasswordPage,
    ForgotPasswordPage,
    VerifypaypalPage,
    VerifyQRcodePage,
    SettingsPage,
    ReportPage,
    ReceivemoneyPage,
    SenderPage,
    SendmoneyPage,
    SuperadminPage,
    AdminmanagerPage,
    RegisteredadminPage,
    RequestadminPage,
    LoginPage,
    RegisterPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireDatabaseModule,
    AngularFireAuth,
    BarcodeScanner,
    FirebaseProvider,
    Camera,
    PayPal,
    File,
    FilePath,
    Transfer,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider,
    CurrencyPipe
  ]
})
export class AppModule {}
