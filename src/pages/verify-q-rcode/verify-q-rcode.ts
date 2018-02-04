import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { User } from '../../models/user';
import { LoadingController, Loading } from 'ionic-angular';
import { SenderPage } from '../sender/sender';
import { ReceivemoneyPage } from '../receivemoney/receivemoney';
import { Storage } from '@ionic/storage';
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
  public qrName = null;
  constructor(
    public loadingCtrl: LoadingController,
    public http: Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner,
    private storage : Storage,
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
      this.qrVerifyState = 0;
      this.findQRcode = 0;
      var that = this;
      var query = firebase.database().ref("users").orderByKey();
      query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          if (childSnapshot.val().qrId == that.qrId) {
            that.qrVerifyState = 1;
            that.showAlert("QRcode expired already.");
          }
        });
        console.log(that.qrVerifyState);
      if (that.qrVerifyState == 0){
        query = firebase.database().ref("qrdatas").orderByKey();
        query.once("value").then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val().id == that.qrId ) {
              if (that.findQRcode == 0 ){
              that.findQRcode = 1;
              if (childSnapshot.val().type == 0) {
                if (childSnapshot.val().verify == 0){
                  that.qrName = childSnapshot.val().name;
                   var ref = firebase.database().ref().child('users');
                   var refUserId = ref.orderByChild('id').equalTo(that.user.id);
                  refUserId.once('value', function (snapshot) {
                    if (snapshot.hasChildren()) {
                      snapshot.forEach(
                        function (snap) {
                          snap.ref.update({
                            'permission': 1,
                            'qrId':that.qrId,
                            'qrName':that.qrName
                          });

                          return true;
                        });
                    }
                  });
                  that.user.permission = 1;
                  that.storage.set('currentUser', that.user);
                  that.showAlertSuccess("User QRcode verified");
                  that.verifyConfirmMail(that.user.id);
                  that.updateQRcodeverify(that.qrId);
                }else{
                  that.showAlert("User QRcode expired");
                }

              }else{
                that.qrName = childSnapshot.val().name;
                ref = firebase.database().ref().child('users');
                refUserId = ref.orderByChild('id').equalTo(that.user.id);
                refUserId.once('value', function (snapshot) {
                  if (snapshot.hasChildren()) {
                    snapshot.forEach(
                      function (snap) {
                        snap.ref.update({
                          'groupId': that.qrId,
                          'groupName': that.qrName
                        });
                        that.updateQRgroup(that.qrId);
                        return true;
                      });
                  }
                });

                that.showAlertSuccess("Group QRcode verified");
                that.groupverifyConfirmMail(that.user.id);
                that.navCtrl.push(ReceivemoneyPage, {
                  user: that.user
                });
              }
            }
          }
          });
          if(that.findQRcode == 0){
          }
        });
      }
      });
    });
  }
  updateQRcodeverify(qrnumber){
    var that = this;
    var ref = firebase.database().ref().child('qrdatas');
    var refUserId = ref.orderByChild('id').equalTo(qrnumber);
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
    that.navCtrl.push(ReceivemoneyPage,{
      user:that.user
    });
  }
  updateQRgroup(qrnumber) {
    var that = this;
    var ref = firebase.database().ref().child('qrdatas');

  }
  verifyConfirmMail(userId){
    var that = this;
    var query = firebase.database().ref("users").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().role == 3) {
          var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailuserqrverifiedconfirm?email=' + childSnapshot.val().email + '&username=' + childSnapshot.val().fullName + '&qrName=' + that.qrName + '&qrUserName=' + that.user.fullName + '&qrUserEmail=' + that.user.email  ;
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
  }
  goHome(){
    this.navCtrl.push(SenderPage, {
      user: this.user
    });
  }
  groupverifyConfirmMail(userId) {
    var that = this;
    var query = firebase.database().ref("users").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().role == 3) {
          var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailgroupqrverifiedconfirm?email=' + childSnapshot.val().email + '&username=' + childSnapshot.val().fullName + '&qrName=' + that.qrName + '&qrUserName=' + that.user.fullName + '&qrUserEmail=' + that.user.email;
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
