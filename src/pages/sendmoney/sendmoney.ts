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
    public toastCtrl: ToastController,
    public http : Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private payPal: PayPal,
    private barcodeScanner: BarcodeScanner
  ) {
    this.http = http;
    this.sender = navParams.get("user");
  }

  ionViewDidLoad() {
    this.sendmoneyData.senderid = this.sender.id;
    console.log('ionViewDidLoad SendmoneyPage');
    this.groupReceivers = [];
    this.scanCode();

  }
  sendmoneySelect(money){
    this.sendmoneyData.sendmoney = money;
  }
  sendMoney(sendmoneyData){
    if(this.sendmoneyData.sendmoney == 0 || this.sendmoneyData.sendmoney == null){
      this.showAlert("Please enter money!");
    }else{
      this.showConfirm(sendmoneyData);
    }

  }
  scanCode() {
    this.barcodeScanner.scan().then(barcodeData => {
    // this.qrId = 1511347280139;
      this.qrId = atob(barcodeData.text);
      // this.showAlert(this.qrId);
      var that = this;
      var query = firebase.database().ref("qrdatas").orderByKey();
      query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {

          if (Number(childSnapshot.val().id) == Number(that.qrId)) {

            that.findQRcode = 1;
            if (childSnapshot.val().type == 0) {
              // if (childSnapshot.val().verify == 1) {
                that.findReceiver(that.qrId);
              // }
            } else {
              that.findGroupReceivers(that.qrId);
              that.qrType = 1;
            }
          }
        });
        if (that.findQRcode == 0) {
          // that.showAlert("QR code invalid!");
          that.navCtrl.push(SenderPage, {
            user: that.sender
          });
        }
      });

    });

  }
  findReceiver(qrnumber){
    var that = this;
    var query = firebase.database().ref("users").orderByKey();

    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
          if (childSnapshot.val().qrId == qrnumber) {


              that.sendmoneyData.receiverid = childSnapshot.val().id;
              that.sendmoneyData.receiverpaypalemail = childSnapshot.val().paypalEmail;
              that.sendmoneyData.receiverpaypalverifystate = childSnapshot.val().paypalVerifyState;
              that.sendmoneyData.receivername = childSnapshot.val().fullName;
              that.receiverAvatar = childSnapshot.val().avatar();
              that.sendmoneyData.senderpaypalemail = that.sender.paypalEmail;
              that.sendmoneyData.senderpaypalpassword = that.sender.paypalPassword;
              that.sendmoneyData.senderpaypalverifystate = that.sender.paypalVerifyState;
              that.sendmoneyData.sendername = that.sender.fullName;
              console.log(that.sendmoneyData);

          }
      });
    });

  }
  paytoReceiver(qrnumber) {
    // this.showAlert(qrnumber);
    var that = this;
    var query = firebase.database().ref("users").orderByKey();

    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().qrId == Number(qrnumber)) {
          that.sendmoneyData.receiverid = childSnapshot.val().id;
          that.sendmoneyData.receiverpaypalemail = childSnapshot.val().paypalEmail;
          that.sendmoneyData.receiverpaypalverifystate = childSnapshot.val().paypalVerifyState;
          that.sendmoneyData.receivername = childSnapshot.val().fullName;
          that.receiverAvatar = childSnapshot.val().avatar();
          that.sendmoneyData.senderpaypalemail = that.sender.paypalEmail;
          that.sendmoneyData.senderpaypalpassword = that.sender.paypalPassword;
          that.sendmoneyData.senderpaypalverifystate = that.sender.paypalVerifyState;
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
  showConfirm(sendmoneyData) {

    let confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'You will send $ '+this.sendmoneyData.sendmoney + ' to ' + this.sendmoneyData.receivername,
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

              var now = new Date();
              sendmoneyData.transactionid = now.getTime();
              console.log(this.sendmoneyData);
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
                  payment.payeeEmail = this.sendmoneyData.receiverpaypalemail;
                  this.payPal.renderSinglePaymentUI(payment).then(() => {
                    this.afd.list('transactions').push(sendmoneyData);
                    this.navCtrl.push(ReportPage,{
                      'user':this.sender
                    });
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
        }
      ]
    });
    confirm.present();
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
  gotoHome(){
    this.navCtrl.push(SenderPage, {
      user: this.sender
    });
  }
}
