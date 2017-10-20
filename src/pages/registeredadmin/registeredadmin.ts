import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  Loading, LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
// import { AngularFireDatabase } from 'angularfire2/database';
// import { Observable } from 'rxjs/Observable';
// import { AngularFireAuth } from 'angularfire2/auth';
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
      fullname: any,
      email: any,
      password: any,
      cardname: any,
      cardnumber: any,
      expirydate: any,
      cvv: any,
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
    console.log('ionViewDidLoad RequestadminPage');

    console.log('that.items');
    var that = this;
    that.items = [];
    // var starCountRef = firebase.database().ref('users/');
    var query = firebase.database().ref("users").orderByKey();
    console.log(query);
    query.once("value").then(function (snapshot) {

      snapshot.forEach(function (childSnapshot) {
        if(childSnapshot.val().role == 2 && childSnapshot.val().permission == 1){

            that.items.push({
              fullname: childSnapshot.val().fullname,
              email: childSnapshot.val().email,
              password: childSnapshot.val().password,
              cardname: childSnapshot.val().cardname,
              cardnumber: childSnapshot.val().cardnumber,
              expirydate: childSnapshot.val().expirydate,
              cvv: childSnapshot.val().cvv
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
