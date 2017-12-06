import { SenderPage } from '../sender/sender';
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
import { VerifyQRcodePage } from '../verify-q-rcode/verify-q-rcode';
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
  public qrRequest:number;
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
    console.log(this.user);
    console.log('ionViewDidLoad ReportPage');
    if(this.user.permission == 0){
      this.qrRequest = 0;
    }else{
      this.qrRequest = 1;
    }
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
  requestQRcode(){

    var that = this;
    var query = firebase.database().ref("users").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().role == 3) {
          console.log(childSnapshot.val().fullName);
          var link = 'http://tipqrbackend.com.candypickers.com/sendsuperadminuserregisterconfirm?supermailaddress=' + childSnapshot.val().email + '&supername=' + childSnapshot.val().fullName + '&usermail=' + that.user.email + '&username=' + that.user.fullName + '&userpassword=' + that.user.password;
          console.log(link);
          that.http.get(link).map(res => res.json())
            .subscribe(data => {
              console.log(data);
            }, error => {
              console.log("Oooops!");
            });
        }
      });
    });
    that.showAlertSuccess("Your Request for QR code has been processed!");
    that.qrRequest = 1;
  }
  verifyQRcode(){
    this.navCtrl.push(VerifyQRcodePage, {
      user: this.user
    });
  }
  goHome(){
    this.navCtrl.push(SenderPage, {
      user: this.user
    });
  }
  showAlertSuccess(text) {
    let alert = this.alertCtrl.create({
      title: 'Success!',
      subTitle: text,
      buttons: [{
        text: "OK",
      }]
    });
    alert.present();
  }

}
