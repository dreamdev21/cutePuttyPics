import { SettingsPage } from '../settings/settings';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User } from '../../models/user';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';

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
  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public afd: AngularFireDatabase,
    public http: Http,
  ) {
    this.loginUser = navParams.get("user");
    this.http = http;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');
  }
  goUserManager(){
    // this.navCtrl.push(UsermanagerPage, {
    //   user: this.loginUser
    // });
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
    this.createdCode = btoa(this.qrcodeName.toString());
    var link = 'http://localhost:8000/sendhtmlionicmailgroupqrcode?email=' + this.loginUser.email + '&username=' + this.loginUser.fullName + '&qrcode=' + this.createdCode + '&qrGroupName=' + this.qrcodeName;
    console.log(link);
    this.http.get(link).map(res => res.json())
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log("Oooops!");
      });
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
    this.createdCode = btoa(this.qrcodeName.toString());
    var link = 'http://localhost:8000/sendhtmlionicmailuserqrcode?email=' + this.loginUser.email + '&username=' + this.loginUser.fullName + '&qrcode=' + this.createdCode + '&qrGroupName=' + this.qrcodeName;
    console.log(link);
    this.http.get(link).map(res => res.json())
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log("Oooops!");
      });
  }
}
