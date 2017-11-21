import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { User } from '../../models/user';
import { LoadingController, Loading } from 'ionic-angular';

/**
 * Generated class for the VerifyQRcodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-verify-q-rcode',
  templateUrl: 'verify-q-rcode.html',
})
export class VerifyQRcodePage {

  loading: Loading;
  scannedCode = null;
  qrVerifyState = 0;
  findQRcode = 0;
  public user = {} as User;
  public qrId = null;
  constructor(
    public loadingCtrl: LoadingController,
    public http: Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner,
  ) {
    this.http = http;
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VerifyQRcodePage');
    this.scanCode();

  }
  scanCode() {
    this.barcodeScanner.scan().then(barcodeData => {
    this.qrId = atob(barcodeData.text);
    this.showAlert(this.qrId);
      this.qrVerifyState = 0;
      this.findQRcode = 0;
        var that = this;
        var query = firebase.database().ref("qrdatas").orderByKey();
        query.once("value").then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().id == that.qrId && that.findQRcode == 0 ) {
              that.findQRcode = 1;
              if (childSnapshot.val().type == 0) {
                if (childSnapshot.val().verify == 0){

                  var ref = firebase.database().ref().child('users');
                  var refUserId = ref.orderByChild('id').equalTo(that.user.id);
                  refUserId.once('value', function (snapshot) {
                    if (snapshot.hasChildren()) {
                      snapshot.forEach(
                        function (snap) {
                          snap.ref.update({
                            'permission': 1,
                            'qrId':that.qrId
                          });
                          return true;
                        });
                    }
                  });
                  ref = firebase.database().ref().child('qrdatas');
                  refUserId = ref.orderByChild('id').equalTo(that.qrId);
                  refUserId.once('value', function (snapshot) {
                    if (snapshot.hasChildren()) {
                      snapshot.forEach(
                        function (snap) {
                          snap.ref.update({
                            'verify': 1,
                          });
                          return true;
                        });
                    }
                  });
                  that.showAlert("User QRcode verified");
                }else{
                  that.showAlert("User QRcode expired");
                }

              }else{
                 ref = firebase.database().ref().child('users');
                 refUserId = ref.orderByChild('id').equalTo(that.user.id);
                refUserId.once('value', function (snapshot) {
                  if (snapshot.hasChildren()) {
                    snapshot.forEach(
                      function (snap) {
                        snap.ref.update({
                          'groupId': that.qrId
                        });
                        return true;
                      });
                  }
                });
                ref = firebase.database().ref().child('qrdatas');
                refUserId = ref.orderByChild('id').equalTo(that.qrId);
                refUserId.once('value', function (snapshot) {
                  if (snapshot.hasChildren()) {
                    snapshot.forEach(
                      function (snap) {
                        snap.ref.update({
                          'groupUsers': Number(childSnapshot.val().groupUsers) + 1,
                        });
                        return true;
                      });
                  }
                });
                that.showAlert("Group QRcode verified");
              }
            }
          });
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
}
