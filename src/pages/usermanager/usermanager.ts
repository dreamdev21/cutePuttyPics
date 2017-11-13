import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RequestadminPage} from '../requestadmin/requestadmin';
import { RegisteredadminPage } from '../registeredadmin/registeredadmin';
import { User } from '../../models/user';
/**
 * Generated class for the UsermanagerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-usermanager',
  templateUrl: 'usermanager.html',
})
export class UsermanagerPage {
  public user = {} as User;
  loginUser ={} as User;
  requestadmintab = RequestadminPage;
  registeredadmintab = RegisteredadminPage;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,

  ) {
    this.user = navParams.get("user");
    this.loginUser = this.user;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminmanagerPage');
  }

}
