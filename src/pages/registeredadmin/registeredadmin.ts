import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  Loading, LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';


/**
 * Generated class for the RegisteredadminPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-registeredadmin',
  templateUrl: 'registeredadmin.html',
})
export class RegisteredadminPage {

  loading : Loading;
  public user = {} as User;
  public users: any;

  public items: Array<{
      avatar:any,
      fullName: any,
      email: any,
      password: any,
     }>
  constructor(

    public navCtrl: NavController,
    public firebaseProvider: FirebaseProvider,
    public http : Http,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams
  ) {
    this.http = http;
  }

  ionViewDidLoad() {
    var text =  'Loading...';
    this.showLoading(text);
    var that = this;
    that.items = [];
    var query = firebase.database().ref("users").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if(childSnapshot.val().role == 1){
            that.items.push({
              avatar:childSnapshot.val().avatar,
              fullName: childSnapshot.val().fullName,
              email: childSnapshot.val().email,
              password: childSnapshot.val().password,
          });
        }
      });
    });
    that.loading.dismiss();
  }
  showLoading(text) {
    this.loading = this.loadingCtrl.create({
      content: text,
      dismissOnPageChange: true,
      showBackdrop: false
    });
    this.loading.present();
  }
}
