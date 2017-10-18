import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RequestadminPage} from '../requestadmin/requestadmin';
import { RegisteredadminPage } from '../registeredadmin/registeredadmin';
/**
 * Generated class for the AdminmanagerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-adminmanager',
  templateUrl: 'adminmanager.html'
})
export class AdminmanagerPage {
  requestadmintab = RequestadminPage;
  registeredadmintab = RegisteredadminPage;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,

  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminmanagerPage');
  }

}
