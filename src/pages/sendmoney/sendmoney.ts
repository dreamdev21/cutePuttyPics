import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { sendmoneyData } from '../../models/sendmoneyData';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { ReportPage } from '../report/report';
/**
 * Generated class for the SendmoneyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sendmoney',
  templateUrl: 'sendmoney.html',
})
export class SendmoneyPage {
  scannedCode = null;
  createdCode = null;
  public findtransaction = false;
  public sendmoneyData = {} as sendmoneyData;
  public sendmethodtext:any;
  public toastText:string;
  public receivemethodtext:any;
  public receivers:any;
  public sender = {} as User;
  public receiver = {} as User;
  public transactiondata = {} as sendmoneyData;
  constructor(
    public toastCtrl: ToastController,
    public http : Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private payPal: PayPal
  ) {
    this.http = http;
    this.sender = navParams.get("user");
  }

  ionViewDidLoad() {
    this.sendmoneyData.senderid = this.sender.id;
    console.log('ionViewDidLoad SendmoneyPage');
    var that = this;
    that.receivers = [];
    var query = firebase.database().ref("users").orderByKey();
    query.once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().role == 0 ) {
          that.receivers.push(childSnapshot.val());
        }
        });
    });

  }
  sendmoneySelect(money){
    this.sendmoneyData.sendmoney = money;
  }
  sendMoney(sendmoneyData){
    if(this.sendmoneyData.sendmoney == 0 || this.sendmoneyData.sendmoney == null){
      this.showAlert("Please enter money!");
      this.showConfirm(sendmoneyData);
    }

  }

  showConfirm(sendmoneyData) {

    let confirm = this.alertCtrl.create({
      title: 'Confirm',
      message: 'You will send $ '+this.sendmoneyData.sendmoney + ' from your paypal to receiver`s paypal',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('No clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            try{

              var now = new Date();
              sendmoneyData.transactionid = now.getTime();
              sendmoneyData.state = 0;
              sendmoneyData.receiverid = this.receiver.id;
              this.createdCode = btoa(this.sendmoneyData.transactionid.toString());
              var that = this;

              var query = firebase.database().ref("users").orderByKey();
              query.once("value").then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    if (childSnapshot.val().id == that.receiver.id){
                      that.sendmoneyData.receiverpaypalemail = childSnapshot.val().paypalemail;
                      that.sendmoneyData.receivercardnumber = childSnapshot.val().cardnumber;
                      that.sendmoneyData.receivercardexpirydate = childSnapshot.val().expirydate;
                      that.sendmoneyData.receivercardcvv = childSnapshot.val().cvv;
                      that.sendmoneyData.receiverpaypalverifystate = childSnapshot.val().paypalverifystate;
                      that.sendmoneyData.receivername = childSnapshot.val().fullname;
                      that.sendmoneyData.senderpaypalemail = that.sender.paypalemail;
                      that.sendmoneyData.senderpaypalpassword = that.sender.paypalpassword;
                      that.sendmoneyData.sendercardnumner = that.sender.cardnumber;
                      that.sendmoneyData.sendercardexpirydate = that.sender.expirydate;
                      that.sendmoneyData.sendercardcvv = that.sender.cvv;
                      that.sendmoneyData.senderpaypalverifystate = that.sender.paypalverifystate;
                      that.sendmoneyData.sendername = that.sender.fullname;
                      that.afd.list('/transactions/').push(sendmoneyData);

                    }

                  });
                });

                var receiverRef = firebase.database().ref("transactions/");
                receiverRef.on("child_changed", function(data) {
                   that.transactiondata = data.val();
                   if(that.transactiondata.senderid==that.sendmoneyData.senderid && that.transactiondata.transactionid == that.sendmoneyData.transactionid){

                    if(that.transactiondata.state == 1){

                      console.log(that.transactiondata);

                     that.presentToast("Receiver "+that.sendmoneyData.receivername + " scanned QR code!");

                     that.payPal.init({
                      PayPalEnvironmentProduction: 'AShaK_z3g4OBVcdYtG0oDuwBmgNXFxGBHD41Q7oYxqHY6fXiNcAI-hmoy3P62HEifRxqvYDoxK5cWnp9',
                      PayPalEnvironmentSandbox: 'AZcU9_W5Ri_P6WvKvaY7LHoWnJms_lwks6fRUEBpyrAl43mtdaKIuz0Wf8cET0SQSypN0oycJQVHObHm'
                     }).then(() => {

                     that.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
                       // Only needed if you get an "Internal Service Error" after PayPal login!
                       //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
                     })).then(() => {

                      let payment = new PayPalPayment(that.transactiondata.sendmoney.toString(), 'USD', 'Description', 'sale');

                       payment.payeeEmail = that.transactiondata.receiverpaypalemail;

                       that.payPal.renderSinglePaymentUI(payment).then(() => {

                         query = firebase.database().ref("transactions").orderByKey();
                         query.once("value").then(function (snapshot) {
                            snapshot.forEach(function (childSnapshot) {
                              if (childSnapshot.val().transactionid == that.sendmoneyData.transactionid){
                                if(childSnapshot.val().state == 1 ){
                                  var ref = firebase.database().ref().child('transactions');
                                  var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                                  refUserId.once('value', function(snapshot) {
                                    if (snapshot.hasChildren()) {
                                        snapshot.forEach(
                                          function(snap){
                                            snap.ref.update({
                                              'state':2
                                            });
                                            return true;
                                        });
                                    }
                                  });
                                }
                              }
                            });
                         });

                       }, () => {
                         // Error or render dialog closed without being successful
                         that.showAlert("Transaction is not completed.Please rescan qr code.");
                         that.showAlert("Something wrong.");
                         query = firebase.database().ref("transactions").orderByKey();
                         query.once("value").then(function (snapshot) {
                            snapshot.forEach(function (childSnapshot) {
                              if (childSnapshot.val().transactionid == that.sendmoneyData.transactionid){
                                if(childSnapshot.val().state == 1 ){
                                  var ref = firebase.database().ref().child('transactions');
                                  var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                                  refUserId.once('value', function(snapshot) {
                                    if (snapshot.hasChildren()) {
                                        snapshot.forEach(
                                          function(snap){
                                            snap.ref.update({
                                              'state':3
                                            });
                                            return true;
                                        });
                                    }
                                  });
                                }
                              }
                            });
                         });
                       });
                     }, () => {
                       // Error in configuration
                       that.showAlert("Paypal configration error.Please rescan qr code.");
                       that.showAlert("Something wrong.");
                       query = firebase.database().ref("transactions").orderByKey();
                       query.once("value").then(function (snapshot) {
                          snapshot.forEach(function (childSnapshot) {
                            if (childSnapshot.val().transactionid == that.sendmoneyData.transactionid){
                              if(childSnapshot.val().state == 1 ){
                                var ref = firebase.database().ref().child('transactions');
                                var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                                refUserId.once('value', function(snapshot) {
                                  if (snapshot.hasChildren()) {
                                      snapshot.forEach(
                                        function(snap){
                                          snap.ref.update({
                                            'state':3
                                          });
                                          return true;
                                      });
                                  }
                                });
                              }
                            }
                          });
                       });
                     });
                   }, () => {
                     // Error in initialization, maybe PayPal isn't supported or something else
                     that.showAlert("Something wrong.Please rescan qr code.");
                     query = firebase.database().ref("transactions").orderByKey();
                     query.once("value").then(function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                          if (childSnapshot.val().transactionid == that.sendmoneyData.transactionid){
                            if(childSnapshot.val().state == 1 ){
                              var ref = firebase.database().ref().child('transactions');
                              var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                              refUserId.once('value', function(snapshot) {
                                if (snapshot.hasChildren()) {
                                    snapshot.forEach(
                                      function(snap){
                                        snap.ref.update({
                                          'state':3
                                        });
                                        return true;
                                    });
                                }
                              });
                            }
                          }
                        });
                     });
                   });
                  }else if(that.transactiondata.state == 2){
                    that.showAlertSuccess("Transaction completed!");
                    that.navCtrl.push(ReportPage, {
                      user:that.sender
                    });
                  }else{
                    // that.showAlert("Transaction not completed!");
                  }

                   }
                });

            }
            catch(e){
              console.error(e);
              this.showAlert("Something wrong");
            }
          }
        }
      ]
    });
    confirm.present();
  }
  goPaypal(transactiondata){

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
  presentToast(text) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
}
