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
  public transactionid = null;
  public fundtransaction = null;
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

    this.barcodeScanner.scan().then(barcodeData => {
      this.transactionid=atob(barcodeData.text);

      var that = this;
      var query = firebase.database().ref("transactions").orderByKey();
      query.once("value").then(function (snapshot) {
        that.fundtransaction = 0;
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().transactionid == that.transactionid){
              that.fundtransaction = 1;
              if(childSnapshot.val().state == 0 || childSnapshot.val().state == 3){
                var ref = firebase.database().ref().child('transactions');
                var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                refUserId.once('value', function(snapshot) {
                  if (snapshot.hasChildren()) {
                    snapshot.forEach(
                      function(snap){
                        snap.ref.update({
                          'state':1
                        });
                        return true;
                    });
                  }
                });
              }
           }
        });
      });
      if(this.fundtransaction == 0){
        this.showAlert("QR code invalid or expired already!");
      }


    var receiverRef = firebase.database().ref("transactions/");
    receiverRef.on("child_changed", function(data) {
       var transactiondata = data.val();
       if(transactiondata.receiverid==this.user.id && transactiondata.transactionid == this.transactionid){
        if(transactiondata.state == 1){
          this.loading = this.loadingCtrl.create({
            content: 'Processing...',
          });
        }else if(transactiondata.state == 2){
          this.loading.dismissAll();
          this.showAlertSuccess("Transaction complete!");
          this.navCtrl.push(ReportPage, {
            user:this.user
          });
        }else if(transactiondata.state == 3){
          this.loading.dismissAll();
          this.showAlert("Something wrong!");
        }
       }

    });
  });
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
