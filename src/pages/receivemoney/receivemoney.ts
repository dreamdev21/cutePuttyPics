import { changeExtension } from '@ionic/app-scripts/dist';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
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
  loading: Loading;
  scannedCode = null;
  public user = {} as User;
  public findtransaction = false;
  public transactionid = null;
  constructor(
    public loadingCtrl: LoadingController,
    public http : Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner,
  ) {
    this.http = http;
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReceivemoneyPage');
    this.scanCode();
  }
  scanCode() {
    this.findtransaction = false;
    this.barcodeScanner.scan().then(barcodeData => {
      this.transactionid=atob(barcodeData.text);
      this.findtransaction = false;
      var that = this;
      var query = firebase.database().ref("transactions").orderByKey();
      query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().transactionid == that.transactionid){
              if(childSnapshot.val().state == 0){
                console.log(childSnapshot.val().transactionid);
                var ref = firebase.database().ref().child('transactions');
                var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                refUserId.once('value', function(snapshot) {
                  if (snapshot.hasChildren()) {
                      snapshot.forEach(
                        function(snap){
                          console.log(snap.val());
                          snap.ref.update({
                            'state':1
                          });
                          that.findtransaction = true;
                          // that.showAlertSuccess("This transaction is completed successfully!");
                          return true;
                      });
                  } else {
                    console.log('wrong');
                  }
                });
            }else{
              that.findtransaction = true;
              that.showAlert("This transaction was completed already!");
            }
          }
        });
      });
      var receiverRef = firebase.database().ref("transactions/");
      receiverRef.on("child_changed", function(data) {
        console.log(data.val());
        console.log(that.transactionid);
        if(data.val().transactionid = that.transactionid && data.val().state == 1){
          if( data.val().transactionstate == 0){
            that.loading = that.loadingCtrl.create({
              content: 'Processing...',
            });
            that.loading.present();
          }else{
            that.loading.dismissAll();
            that.showAlertSuccess("Transaction completed!");
            that.navCtrl.push(ReportPage, {
              user:that.user
            });
          }
        }
      });
    }, (err) => {
      console.log('Error: ', err);
    });



  }
  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
  }
  showAlert(text) {
    let alert = this.alertCtrl.create({
      title: 'Warning!',
      subTitle: text,
      buttons: [{
        text: "OK",
      }]
    });
    alert.present();
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
