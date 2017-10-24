import { changeExtension } from '@ionic/app-scripts/dist';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { User } from '../../models/user';
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
  scannedCode = null;
  public user = {} as User;
  public findtransaction = false;
  constructor(
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
      var transactionid=atob(barcodeData.text);
      this.findtransaction = false;
      var that = this;
      var query = firebase.database().ref("transactions").orderByKey();
      query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().transactionid == transactionid){
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
                          that.showAlert("This transaction is completed successfully!");
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
    }, (err) => {
      console.log('Error: ', err);
    });
    // this.showAlert(this.findtransaction);
    // if(!this.findtransaction){
    //   this.showAlert("QR code invalid");
    // }
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
}
