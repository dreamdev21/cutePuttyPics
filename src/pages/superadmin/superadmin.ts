import { SettingsPage } from '../settings/settings';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User } from '../../models/user';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { AllTransactionsPage } from '../all-transactions/all-transactions';
import { PendingTransactionsPage } from '../pending-transactions/pending-transactions';

/**
 * Generated class for the SuperadminPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-superadmin',
  templateUrl: 'superadmin.html',
})
export class SuperadminPage {
  public loginUser = {} as User;
  qrcodeName = null;
  qrcodeId= null;
  groupUsers = null;
  createdCode = null;
  userQRcodeVerify = 0;
  qrUserEmail : any;
  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public afd: AngularFireDatabase,
    public http: Http,
    public storage: Storage
  ) {
    this.loginUser = navParams.get("user");
    this.http = http;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');
  }
  goUserManager(){
    this.showUserPrompt();
  }
  goAdminManager() {
    this.showGroupPrompt();
  }
  goSetting(){
    this.navCtrl.push(SettingsPage,{
      user: this.loginUser
    });
  }
  showGroupPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Generate QR Code',
      message: "Enter new group name",
      inputs: [
        {
          name: 'name',
          placeholder: 'Google'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Create',
          handler: data => {
            this.qrcodeName = data.name;

            this.createGroupCode();
          }
        }
      ]
    });
    prompt.present();
  }
  showUserPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Generate QR Code',
      message: "Enter new QRcode name",
      inputs: [
        {
          name: 'name',
          placeholder: 'Johnathan'
        },
        {
          name: 'email',
          placeholder: 'john@doe.com',
          type: 'email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Create',
          handler: data => {
            this.qrcodeName = data.name;
            this.qrUserEmail = data.email;
            this.createUserCode();
          }
        }
      ]
    });
    prompt.present();
  }
  createGroupCode() {
    var now = new Date();
    this.qrcodeId = now.getTime();
    this.afd.list('/qrdatas/').push({
      type:1,
      name: this.qrcodeName,
      id: this.qrcodeId,
      groupUsers:0,

    });
    this.createdCode = btoa(this.qrcodeId.toString());
    var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailgroupqrcode?email=' + this.loginUser.email + '&username=' + this.loginUser.fullName + '&qrcode=' + this.createdCode + '&qrGroupName=' + this.qrcodeName;
    console.log(link);
    this.http.get(link).map(res => res.json())
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log("Oooops!");
      });
    this.showAlertSuccess("QR code successfully generated");
  }
  createUserCode() {
    var now = new Date();
    this.qrcodeId = now.getTime();
    this.afd.list('/qrdatas/').push({
      type: 0,
      name: this.qrcodeName,
      id:this.qrcodeId,
      verify:0,

    });
    this.createdCode = btoa(this.qrcodeId.toString());
    var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailuserqrcode?email=' + this.loginUser.email + '&username=' + this.loginUser.fullName + '&qrcode=' + this.createdCode + '&qrGroupName=' + this.qrcodeName;
    console.log(link);
    this.http.get(link).map(res => res.json())
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log("Oooops!");
      });
    link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailuserqrcodetouser?email=' + this.qrUserEmail + '&qrcode=' + this.createdCode + '&qrGroupName=' + this.qrcodeName;
    console.log(link);
    this.http.get(link).map(res => res.json())
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log("Oooops!");
      });
    this.showAlertSuccess("QR code successfully generated");
  }
  showAlertSuccess(text) {
    let alert = this.alertCtrl.create({
      title: 'Success!',
      subTitle: text,
      buttons: [{
        text: "OK",
      }]
    });
    alert.present();
  }
  goLogout() {
    this.storage.remove('currentUser');
    this.navCtrl.push(LoginPage);
  }
  goAllTransactions(){
    this.navCtrl.push(AllTransactionsPage, {
      user: this.loginUser
    });
  }
  goPendingTransactions() {
    this.navCtrl.push(PendingTransactionsPage, {
      user: this.loginUser
    });
  }
}
