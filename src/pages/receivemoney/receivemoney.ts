
import { CashOutPage } from '../cash-out/cash-out';
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
import { Storage } from '@ionic/storage';
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
  public qrVerified:number;
  public userAddress:string;
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    private storage: Storage,
  ) {
    this.user = navParams.get("user");
    this.http = http;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportPage');
    if(this.user.permission == 0){
      this.qrVerified = 0;
    }else{
      this.qrVerified = 1;
    }
    if (this.user.qrRequested == 0) {
      this.qrRequest = 0;
    } else {
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
        if (childSnapshot.val().state == 1) {
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
            that.receivetransactions.unshift(transaction);
            that.transactiontotalmoneyreceived += Number(childSnapshot.val().sendmoney);
          }
        }
      });
    });
  }
  deleteTransaction(id) {
    var that = this;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().transactionid == id) {
          childSnapshot.ref.remove();
          that.navCtrl.push(ReportPage, {
            user: that.user
          });
        }
      });
    });
  }
  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Please Enter Home Address.',
      inputs: [
        {
          name: 'address',
          placeholder: 'Home Address'
        },

      ],

      buttons: [

        {
          text: 'Request',
          handler: data => {
            this.userAddress =data.address;
            this.requestQRcode();
          }
        }
      ]
    });

    alert.present();
  }
  requestQRcode(){
    if(this.userAddress){
      var that = this;
      var query = firebase.database().ref("users").orderByKey();
      query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (childSnapshot.val().role == 3) {
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
      that.user.qrRequested = 1;
      that.user.address = that.userAddress;
      that.storage.set('currentUser', that.user);
      var ref = firebase.database().ref().child('users');
      var refUserId = ref.orderByChild('id').equalTo(that.user.id);
      refUserId.once('value', function (snapshot) {
        if (snapshot.hasChildren()) {
          snapshot.forEach(
            function (snap) {
              snap.ref.update({
                'qrRequested': 1,
                'address': that.userAddress
              });

              return true;
            });
        }
      });
    }else{
      this.showAlert("Please enter home address!");
    }

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
  showAlert(text) {
    let alert = this.alertCtrl.create({
      title: 'Oops!',
      subTitle: text,
      buttons: [{
        text: "OK",
      }]
    });
    alert.present();
  }
  goCashout() {
    this.navCtrl.push(CashOutPage, {
      user: this.user
    });
  }
}
