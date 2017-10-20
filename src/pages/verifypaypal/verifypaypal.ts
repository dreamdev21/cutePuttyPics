import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';
/**
 * Generated class for the VerifypaypalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-verifypaypal',
  templateUrl: 'verifypaypal.html',
})
export class VerifypaypalPage {
  public user:User;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VerifypaypalPage');
  }
  verifyPaypal(user){

  }
}
