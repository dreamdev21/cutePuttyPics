import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { sendmoneyData } from '../../models/sendmoneyData';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
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
  qrData = "QR test data";
  createdCode = null;
  scannedCode = null;
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
    private barcodeScanner: BarcodeScanner,
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

    console.log(that.receivers);
  }
  sendmoneySelect(money){
    this.sendmoneyData.sendmoney = money;
  }
  sendMoney(sendmoneyData){
    console.log(this.receiver.id);
    if(this.sendmoneyData.sendmoney == 0 || this.sendmoneyData.sendmoney == null){
      this.showAlert("Please enter money!");
    }else if(!this.receiver.id){
      this.showAlert("Please select  receiver!")
    }else{
      this.showConfirm(sendmoneyData);
      console.log(sendmoneyData);
    };

  }

  showConfirm(sendmoneyData) {
    // if(this.sendmoneyData.sendmethod == 0){
    //    this.sendmethodtext = "Paypal";
    // }else{
    //    this.sendmethodtext = "Debit card";
    // }
    // if(this.sendmoneyData.receivemethod == 0){
    //    this.receivemethodtext = "Paypal";
    // }else{
    //    this.receivemethodtext = "Debit card";
    // }
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
              console.log(this.sendmoneyData.transactionid.toString());
              this.createdCode = btoa(this.sendmoneyData.transactionid.toString());
              var that = this;

              var query = firebase.database().ref("users").orderByKey();
              query.once("value").then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    if (childSnapshot.val().id == that.receiver.id){
                      console.log(childSnapshot.val().email);
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
                      // var link = 'http://tipqrbackend.com.candypickers.com/sendtransactionemail?senderemail=' + that.sender.email + '&sendername='+ that.sender.fullname +'&receiveremail='+ childSnapshot.val().email + '&receivername='+ childSnapshot.val().fullname + '&qrcode='+ btoa(that.sendmoneyData.transactionid.toString());
                      // that.http.get(link).map(res => res.json())
                      // .subscribe(data => {
                      //   console.log(data);
                      // }, error => {
                      // console.log("Oooops!");
                      // });

                    }

                  });
                });

                var receiverRef = firebase.database().ref("transactions/");
                receiverRef.on("child_changed", function(data) {
                   that.transactiondata = data.val();
                   if(that.transactiondata.senderid==that.sendmoneyData.senderid && that.transactiondata.state == 1){
                     console.log(that.transactiondata);
                     that.presentToast("Receiver "+that.sendmoneyData.receivername + " scanned QR code!");

                     var query = firebase.database().ref("transactions").orderByKey();
                     that.findtransaction = false;
                     query.once("value").then(function (snapshot) {
                       snapshot.forEach(function (childSnapshot) {
                           if (childSnapshot.val().transactionid == that.sendmoneyData.transactionid){
                             if(childSnapshot.val().state == 1){
                               console.log(childSnapshot.val().transactionid);
                               var ref = firebase.database().ref().child('transactions');
                               var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                               refUserId.once('value', function(snapshot) {
                                 if (snapshot.hasChildren()) {
                                     snapshot.forEach(
                                       function(snap){
                                         console.log(snap.val());
                                         snap.ref.update({
                                           'transactionstate':0
                                         });
                                         that.findtransaction = true;
                                         return true;
                                     });
                                 } else {
                                   console.log('wrong');
                                 }
                               });
                           }else{
                             that.findtransaction = true;
                            //  that.showAlert("This transaction was completed already!");
                           }
                         }
                       });
                     });
                     console.log(that.transactiondata.receiverpaypalemail);
                     console.log(that.transactiondata.sendmoney);
                     that.payPal.init({
                      PayPalEnvironmentProduction: 'AShaK_z3g4OBVcdYtG0oDuwBmgNXFxGBHD41Q7oYxqHY6fXiNcAI-hmoy3P62HEifRxqvYDoxK5cWnp9',
                      PayPalEnvironmentSandbox: 'AZcU9_W5Ri_P6WvKvaY7LHoWnJms_lwks6fRUEBpyrAl43mtdaKIuz0Wf8cET0SQSypN0oycJQVHObHm'
                     }).then(() => {
                     // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
                     that.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
                       // Only needed if you get an "Internal Service Error" after PayPal login!
                       //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
                     })).then(() => {
                       let payment = new PayPalPayment(that.transactiondata.sendmoney.toString(), 'USD', 'Description', 'sale');

                       payment.payeeEmail = that.transactiondata.receiverpaypalemail;

                       that.payPal.renderSinglePaymentUI(payment).then(() => {



                         // this.showAlertSuccess("Transaction completed sucessfully.");
                         // Successfully paid

                         // Example sandbox response
                         //
                         // {
                         //   "client": {
                         //     "environment": "sandbox",
                         //     "product_name": "PayPal iOS SDK",
                         //     "paypal_sdk_version": "2.16.0",
                         //     "platform": "iOS"
                         //   },
                         //   "response_type": "payment",
                         //   "response": {
                         //     "id": "PAY-1AB23456CD789012EF34GHIJ",
                         //     "state": "approved",
                         //     "create_time": "2016-10-03T13:33:33Z",
                         //     "intent": "sale"
                         //   }
                         // }
                       }, () => {
                         // Error or render dialog closed without being successful
                       });
                     }, () => {
                       // Error in configuration
                     });
                   }, () => {
                     // Error in initialization, maybe PayPal isn't supported or something else
                   });

                   }
                });
                query = firebase.database().ref("transactions").orderByKey();
                that.findtransaction = false;
                query.once("value").then(function (snapshot) {
                  snapshot.forEach(function (childSnapshot) {
                      if (childSnapshot.val().transactionid == that.sendmoneyData.transactionid){
                        if(childSnapshot.val().state == 1){
                          console.log(childSnapshot.val().transactionid);
                          var ref = firebase.database().ref().child('transactions');
                          var refUserId = ref.orderByChild('transactionid').equalTo(childSnapshot.val().transactionid);
                          refUserId.once('value', function(snapshot) {
                            if (snapshot.hasChildren()) {
                                snapshot.forEach(
                                  function(snap){
                                    console.log(snap.val());
                                    snap.ref.update({
                                      'transactionstate':1
                                    });
                                    that.findtransaction = true;
                                    return true;
                                });
                            } else {
                              console.log('wrong');
                            }
                          });
                        }
                    }
                  });
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
