import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AdminmanagerPage } from '../adminmanager/adminmanager';

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
  adminmanagerpage = AdminmanagerPage;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuperadminPage');
  }
  goAdminmanager(){
    this.navCtrl.push(AdminmanagerPage, {
    });
  }
}
