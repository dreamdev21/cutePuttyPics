import * as childProcess from 'child_process';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';


/**
 * Generated class for the ReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {
  public user:any;
  public transactions:any;
  public transaction = {
    avatar:[],
    name:[],
    date:[],
    amount:[],
  };
  public transactiontotalmoney:number;
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http : Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
  ) {
    this.user = navParams.get("user");
    this.http = http;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportPage');
    var that = this;
    that.transactions = [];
    that.transactiontotalmoney = 0;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var transaction = {
          avatar:[],
          name:[],
          date:[],
          amount:[],
        }
        if(that.user.role == 0){
          if (childSnapshot.val().receiverid == that.user.id && childSnapshot.val().state == 2){
            var senderid = childSnapshot.val().senderid;
            var query = firebase.database().ref("users").orderByKey();
            query.once("value").then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().id == senderid ) {
                  transaction.avatar.push(childSnapshot.val().avatar);
                  transaction.name.push(childSnapshot.val().fullname);
                }
                });
            });
            transaction.date.push(childSnapshot.val().transactionid);
            transaction.amount.push(childSnapshot.val().sendmoney);
            console.log(transaction);
            that.transactions.push(transaction);
            console.log(that.transactions);
            that.transactiontotalmoney += Number(childSnapshot.val().sendmoney);
          }
        }else{
          if (childSnapshot.val().senderid == that.user.id && childSnapshot.val().state == 2){
            var receiverid = childSnapshot.val().receiverid;
            query = firebase.database().ref("users").orderByKey();
            query.once("value").then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().id == receiverid ) {
                  transaction.avatar.push(childSnapshot.val().avatar);
                  transaction.name.push(childSnapshot.val().fullname);
                }
                });
            });
            transaction.date.push(childSnapshot.val().transactionid);
            transaction.amount.push(childSnapshot.val().sendmoney);
            console.log(transaction);
            that.transactions.push(transaction);
            console.log(that.transactions);
            that.transactiontotalmoney += Number(childSnapshot.val().sendmoney);
          }
        }
      });
    });
  }
  deleteTransaction(id){
    console.log(id);
    var that = this;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if(childSnapshot.val().transactionid == id){
          // if(that.showConfirm()){
            childSnapshot.ref.remove();
            that.navCtrl.push(ReportPage, {
              user:that.user
            });
          }
        // }
      });
    });
  }

}
