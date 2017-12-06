import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SendmoneyPage } from '../sendmoney/sendmoney';
import { ReceivemoneyPage } from '../receivemoney/receivemoney';
import { VerifypaypalPage } from '../verifypaypal/verifypaypal';
import { ReportPage } from '../report/report';
import { SettingsPage } from '../settings/settings';
import { LoginPage } from '../login/login';
import { VerifyQRcodePage } from '../verify-q-rcode/verify-q-rcode';
import { User } from '../../models/user';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the SenderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sender',
  templateUrl: 'sender.html',
})
export class SenderPage {
  public user = {} as User;
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage) {
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SenderPage');
  }
 goSendmoney(){
  this.navCtrl.push(SendmoneyPage, {
    user:this.user
  });
 }
 goReceivemoney(){
  this.navCtrl.push(ReceivemoneyPage, {
    user:this.user
  });
 }
 goVerifypaypal(){
  this.navCtrl.push(VerifypaypalPage, {
    user:this.user
  });
 }
 goReports(){
  this.navCtrl.push(ReportPage, {
    user:this.user
  });
 }
 goSettings(){
  this.navCtrl.push(SettingsPage, {
    user:this.user
  });
 }
 goVerifyQRcode(){
   this.navCtrl.push(VerifyQRcodePage,{
     user:this.user
   });
 }
 goLogout(){
  this.storage.remove('currentUser');
  this.navCtrl.push(LoginPage);
 }
}
