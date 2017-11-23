import { changeExtension } from '@ionic/app-scripts/dist';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { User } from '../../models/user';
import { LoadingController ,Loading } from 'ionic-angular';
import { ReportPage } from '../report/report';
/**
 * Generated class for the ReceivemoneyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-receivemoney',
  templateUrl: 'receivemoney.html',
})
export class ReceivemoneyPage {
  public user: any;
  public receivetransactions: any;
  public transaction = {
    avatar: [],
    name: [],
    date: [],
    amount: [],
  };
  public transactiontotalmoneyreceived: number;
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
  ) {
    this.user = navParams.get("user");
    this.http = http;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportPage');
    var that = this;
    that.receivetransactions = [];
    that.transactiontotalmoneyreceived = 0;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var transaction = {
          avatar: [],
          name: [],
          date: [],
          amount: [],
        }
        if (that.user.role == 0) {
          if (childSnapshot.val().receiverid == that.user.id) {
            var senderid = childSnapshot.val().senderid;
            var query = firebase.database().ref("users").orderByKey();
            query.once("value").then(function (snapshot) {
              snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().id == senderid) {
                  transaction.avatar.push(childSnapshot.val().avatar);
                  transaction.name.push(childSnapshot.val().fullName);
                }
              });
            });
           transaction.date.push(childSnapshot.val().transactionid);
            transaction.amount.push(childSnapshot.val().sendmoney);
            that.receivetransactions.push(transaction);
            that.transactiontotalmoneyreceived += Number(childSnapshot.val().sendmoney);
          }
        }
      });
    });
  }
  deleteTransaction(id) {
    console.log(id);
    var that = this;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().transactionid == id) {
          // if(that.showConfirm()){
          childSnapshot.ref.remove();
          that.navCtrl.push(ReportPage, {
            user: that.user
          });
        }
        // }
      });
    });
  }

}
