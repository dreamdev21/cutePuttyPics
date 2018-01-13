import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { sendmoneyData } from '../../models/sendmoneyData';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { ReportPage } from '../report/report';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SenderPage } from '../sender/sender';
import { Storage } from '@ionic/storage';
import { CurrencyPipe } from '@angular/common';
import { LoginPage } from '../login/login';
@IonicPage()
@Component({
  selector: 'page-sendmoney',
  templateUrl: 'sendmoney.html',
})
export class SendmoneyPage {
  scannedCode = null;
  findQRcode = 0;
  qrType = null;
  public qrId = null;
  public findtransaction = false;
  public sendmoneyData = {} as sendmoneyData;
  public sendmethodtext:any;
  public toastText:string;
  public box_price_formatted : string;
  public receivemethodtext:any;
  public receivers:any;
  public sender = {} as User;
  public receiver = {} as User;
  public transactiondata = {} as sendmoneyData;
  public receiverAvatar : any;
  public groupReceivers: Array<{
    fullName: any,
    qrId: any,
  }>
  constructor(
    private currencyPipe: CurrencyPipe,
    public toastCtrl: ToastController,
    public http : Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private payPal: PayPal,
    private storage: Storage,
    private barcodeScanner: BarcodeScanner
  ) {
    this.http = http;
    this.sender = navParams.get("user");
  }

  ionViewDidLoad() {
    this.sendmoneyData.senderid = this.sender.id;
    this.groupReceivers = [];
    this.scanCode();
    let amount = 1337.1337;
    console.log(this.getCurrency(amount));
    // this.findReceiver(1515660899416);

  }
  getCurrency(amount: number) {
    return this.currencyPipe.transform(amount, 'USD', true, '1.2-2');
  }
  sendmoneySelect(money){
    this.sendmoneyData.sendmoney = money;
  }
  sendMoney(sendmoneyData){
    if(this.sendmoneyData.sendmoney == 0 || this.sendmoneyData.sendmoney == null){
      this.showAlert("You forgot to enter a tip!");
    }else{
      var now = new Date();
      sendmoneyData.transactionid = now.getTime();
      this.storage.set('transaction', 1);

      this.payPal.init({
        PayPalEnvironmentProduction: 'AShaK_z3g4OBVcdYtG0oDuwBmgNXFxGBHD41Q7oYxqHY6fXiNcAI-hmoy3P62HEifRxqvYDoxK5cWnp9',
        PayPalEnvironmentSandbox: 'AZcU9_W5Ri_P6WvKvaY7LHoWnJms_lwks6fRUEBpyrAl43mtdaKIuz0Wf8cET0SQSypN0oycJQVHObHm'
      }).then(() => {
        // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
        this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
          // Only needed if you get an "Internal Service Error" after PayPal login!
          //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
        })).then(() => {
          let payment = new PayPalPayment(sendmoneyData.sendmoney.toString(), 'USD', 'Description', 'sale');
          // payment.payeeEmail = this.sendmoneyData.receiverpaypalemail;
          this.payPal.renderSinglePaymentUI(payment).then(() => {
            this.afd.list('/transactions/').push(sendmoneyData);
            this.showAlertSuccess("Transaction completed!");

            this.storage.remove('transaction');
            this.storage.get('currentUser').then((val) => {
              this.navCtrl.push(SenderPage, {
                'user': val
              });
            });

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

  }
  scanCode() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.qrId = atob(barcodeData.text);
      if (this.qrId == "") {
        this.gotoHome();
      }else{

        var that = this;
        var query = firebase.database().ref("qrdatas").orderByKey();
        query.once("value").then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {

            if (childSnapshot.val().id == that.qrId) {
              console.log("qr code find");
              console.log(that.qrId);
              that.findQRcode = 1;
              if (childSnapshot.val().type == 0) {
                // if (childSnapshot.val().verify == 1) {
                  console.log("user qr code");
                  that.findReceiver(that.qrId);
                // }
              } else {
                that.qrType = 1;
                console.log("group qr code");
                that.findGroupReceivers(that.qrId);
              }
            }
          });
          if (that.findQRcode == 0) {
            that.showAlert("QR code invalid!");
            that.navCtrl.push(SenderPage, {
              user: that.sender
            });
          }

        });
      }


    }, (err) => {
      this.navCtrl.push(SenderPage, {
        user: this.sender
      });
    });
  }

  findReceiver(qrnumber){
    console.log("find receiver execute");
    var that = this;
    var query = firebase.database().ref("users").orderByKey();

    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().qrId == qrnumber) {
          console.log("receiver find ");

          if (childSnapshot.val().cashoutMethod == 0) {
            that.showAlert("Sorry, Receiver cashout method did not set");
            that.gotoHome();
          }

          that.sendmoneyData.receiverid = childSnapshot.val().id;
          that.sendmoneyData.receivername = childSnapshot.val().fullName;
          that.receiverAvatar = childSnapshot.val().avatar;
          that.sendmoneyData.sendername = that.sender.fullName;
          that.sendmoneyData.state = 0;
          console.log(that.sendmoneyData.receiverid);
          // that.showAlert(qrnumber);
          // that.sendmoneyData.receiverpaypalemail = childSnapshot.val().paypalEmail;
          // that.sendmoneyData.receiverpaypalverifystate = childSnapshot.val().paypalVerifyState;
          // that.sendmoneyData.senderpaypalemail = that.sender.paypalEmail;
          // that.sendmoneyData.senderpaypalverifystate = that.sender.paypalVerifyState;
          console.log(that.sender.id);
          if (that.sender.id == that.sendmoneyData.receiverid) {
            that.showAlert("Sorry, You can't pay yourself");
            that.gotoHome();
          }

        }
      });
    });

    if(that.sendmoneyData.receiverid){
      that.showAlert("This QR code didn't verified!");
      that.gotoHome();
    }

  }
  paytoReceiver(qrnumber) {
    // this.showAlert(qrnumber);
    var that = this;
    var query = firebase.database().ref("users").orderByKey();

    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().qrId == Number(qrnumber)) {
          that.sendmoneyData.receiverid = childSnapshot.val().id;
          // that.sendmoneyData.receiverpaypalemail = childSnapshot.val().paypalEmail;
          // that.sendmoneyData.receiverpaypalverifystate = childSnapshot.val().paypalVerifyState;
          that.sendmoneyData.receivername = childSnapshot.val().fullName;
          that.receiverAvatar = childSnapshot.val().avatar();
          // that.sendmoneyData.senderpaypalemail = that.sender.paypalEmail;
          // that.sendmoneyData.senderpaypalpassword = that.sender.paypalPassword;
          // that.sendmoneyData.senderpaypalverifystate = that.sender.paypalVerifyState;
          that.sendmoneyData.sendername = that.sender.fullName;

        }
      });
    });
    this.sendMoney(this.sendmoneyData);
  }
  findGroupReceivers(qrnumber) {
    var that = this;
    var query = firebase.database().ref("users").orderByKey();

    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().groupId == qrnumber) {
          if(childSnapshot.val().id != that.sender.id){
            that.groupReceivers.push({
              fullName:childSnapshot.val().fullName,
              qrId:childSnapshot.val().qrId
            });
          }
        }
      });
    });

    // this.selectReceiver(this.groupReceivers);


  }
  selectReceiver(groupReceivers:any) {
    console.log(groupReceivers);
    let alert = this.alertCtrl.create();

    for (let key in this.groupReceivers) {

      let receiver = this.groupReceivers[key];
      console.log(receiver);
      alert.addInput({
        type: 'radio',
        label: receiver.fullName,
        value: receiver.qrId,
        checked: false
      });

    }
    alert.setTitle('Select Group Receiver');
    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.findReceiver(data);
      }
    });
    alert.present();

  }
  goTransaction(receiver){

  }
  // showConfirm(sendmoneyData) {

  //   let confirm = this.alertCtrl.create({
  //     title: 'Are you sure?',
  //     message: 'You will send $ '+this.sendmoneyData.sendmoney + ' to ' + this.sendmoneyData.receivername,
  //     buttons: [
  //       {
  //         text: 'No',
  //         handler: () => {
  //           console.log('No clicked');
  //         }
  //       },
  //       {
  //         text: 'Yes',
  //         handler: () => {

  //             var now = new Date();
  //             sendmoneyData.transactionid = now.getTime();
  //             this.storage.set('transaction', 1);

  //             this.payPal.init({
  //               PayPalEnvironmentProduction: 'AShaK_z3g4OBVcdYtG0oDuwBmgNXFxGBHD41Q7oYxqHY6fXiNcAI-hmoy3P62HEifRxqvYDoxK5cWnp9',
  //               PayPalEnvironmentSandbox: 'AZcU9_W5Ri_P6WvKvaY7LHoWnJms_lwks6fRUEBpyrAl43mtdaKIuz0Wf8cET0SQSypN0oycJQVHObHm'
  //             }).then(() => {
  //               // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
  //               this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
  //                 // Only needed if you get an "Internal Service Error" after PayPal login!
  //                 //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
  //               })).then(() => {
  //                 let payment = new PayPalPayment(sendmoneyData.sendmoney.toString(), 'USD', 'Description', 'sale');
  //                 payment.payeeEmail = this.sendmoneyData.receiverpaypalemail;
  //                 this.payPal.renderSinglePaymentUI(payment).then(() => {
  //                   this.afd.list('/transactions/').push(sendmoneyData);
  //                   this.showAlertSuccess("Transaction completed!");

  //                   this.storage.remove('transaction');
  //                   this.storage.get('currentUser').then((val) => {
  //                     this.navCtrl.push(ReportPage, {
  //                       'user': val
  //                     });
  //                   });


  //                   // Successfully paid

  //                   // Example sandbox response
  //                   //
  //                   // {
  //                   //   "client": {
  //                   //     "environment": "sandbox",
  //                   //     "product_name": "PayPal iOS SDK",
  //                   //     "paypal_sdk_version": "2.16.0",
  //                   //     "platform": "iOS"
  //                   //   },
  //                   //   "response_type": "payment",
  //                   //   "response": {
  //                   //     "id": "PAY-1AB23456CD789012EF34GHIJ",
  //                   //     "state": "approved",
  //                   //     "create_time": "2016-10-03T13:33:33Z",
  //                   //     "intent": "sale"
  //                   //   }
  //                   // }
  //                 }, () => {
  //                   // Error or render dialog closed without being successful
  //                 });
  //               }, () => {
  //                 // Error in configuration
  //               });
  //             }, () => {
  //               // Error in initialization, maybe PayPal isn't supported or something else
  //             });
  //           }
  //       }
  //     ]
  //   });
  //   confirm.present();

  // }

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
  gotoHome(){
    this.navCtrl.push(SenderPage, {
      user: this.sender
    });
  }
  // onChangePrice(evt) {
  //   this.sendmoneyData.sendmoney = evt.replace(/[^0-9.]/g, "");
  //   if (this.sendmoneyData.sendmoney) {
  //     this.box_price_formatted = this.getCurrency(this.sendmoneyData.sendmoney)
  //     console.log("box_price_formatted: " + this.sendmoneyData.sendmoney);
  //   }
  // }
  // onPriceUp(evt) {
  //   this.sendmoneyData.sendmoney = evt.replace(/[^0-9.]/g, "");
  //   this.box_price_formatted = String(this.sendmoneyData.sendmoney);
  // }
  // getCurrency(amount: number) {
  //   return this.currencyPipe.transform(amount, 'USD', true, '1.2-2');
  // }
}
