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
  public senttransactions:any;
  public receivetransactions:any;
  public transaction = {
    avatar:[],
    name:[],
    date:[],
    amount:[],
  };
  public transactiontotalmoneysent:number;
  public transactiontotalmoneyreceived:number;
  switch: string;
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
  ionViewWillEnter() {
    this.switch = "sent";

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportPage');
    var that = this;
    that.senttransactions = [];
    that.receivetransactions = [];
    that.transactiontotalmoneysent = 0;
    that.transactiontotalmoneyreceived = 0;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var transaction = {
          avatar:[],
          name:[],
          date:[],
          amount:[],
        }
          if (childSnapshot.val().receiverid == that.user.id){
            var senderid = childSnapshot.val().senderid;
            var query = firebase.database().ref("users").orderByKey();
            query.once("value").then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().id == senderid ) {
                  transaction.avatar.push(childSnapshot.val().avatar);
                  transaction.name.push(childSnapshot.val().fullName);
                }
                });
            });
            transaction.date.push(childSnapshot.val().transactionid);
            transaction.amount.push(childSnapshot.val().sendmoney);
            console.log(transaction);
            that.receivetransactions.unshift(transaction);
            that.transactiontotalmoneyreceived += Number(childSnapshot.val().sendmoney);
          }
          if (childSnapshot.val().senderid == that.user.id){
            var receiverid = childSnapshot.val().receiverid;
            query = firebase.database().ref("users").orderByKey();
            query.once("value").then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().id == receiverid ) {
                  transaction.avatar.push(childSnapshot.val().avatar);
                  transaction.name.push(childSnapshot.val().fullName);
                }
                });
            });
            transaction.date.push(childSnapshot.val().transactionid);
            transaction.amount.push(childSnapshot.val().sendmoney);
            console.log(transaction);
            that.senttransactions.unshift(transaction);
            that.transactiontotalmoneysent += Number(childSnapshot.val().sendmoney);
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
