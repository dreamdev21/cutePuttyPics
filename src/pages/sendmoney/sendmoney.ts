import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { sendmoneyData } from '../../models/sendmoneyData';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';

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
  public sendmoneyData = {} as sendmoneyData;
  public sendmethodtext:any;
  public toastText:string;
  public receivemethodtext:any;
  public receivers:any;
  public sender = {} as User;
  public receiver = {} as User;
  constructor(
    public toastCtrl: ToastController,
    public http : Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
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
    }else if(!this.sendmoneyData.sendmethod){
      this.showAlert("Please select your payment method!")
    }else if(!this.sendmoneyData.receivemethod){
      this.showAlert("Please select receiver payment method!")
    }else{
      this.showConfirm(sendmoneyData);
    };

  }

  showConfirm(sendmoneyData) {
    if(this.sendmoneyData.sendmethod == 0){
       this.sendmethodtext = "Paypal";
    }else{
       this.sendmethodtext = "Debit card";
    }
    if(this.sendmoneyData.receivemethod == 0){
       this.receivemethodtext = "Paypal";
    }else{
       this.receivemethodtext = "Debit card";
    }
    let confirm = this.alertCtrl.create({
      title: 'Confirm',
      message: 'You will send $ '+this.sendmoneyData.sendmoney + ' from your  ' +this.sendmethodtext+' to receiver`s '+this.receivemethodtext,
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
                      var link = 'http://tipqrbackend.com.candypickers.com/sendtransactionemail?senderemail=' + that.sender.email + '&sendername='+ that.sender.fullname +'&receiveremail='+ childSnapshot.val().email + '&receivername='+ childSnapshot.val().fullname + '&qrcode='+ btoa(that.sendmoneyData.transactionid.toString());
                      that.http.get(link).map(res => res.json())
                      .subscribe(data => {
                        console.log(data);
                      }, error => {
                      console.log("Oooops!");
                      });
                      that.showAlertSuccess("QR code sent to receiver.This transaction will be expired after 1 hour.");
                    }

                  });
                });

                var receiverRef = firebase.database().ref("transactions/");
                receiverRef.on("child_changed", function(data) {
                   var transactiondata = data.val();
                   if(transactiondata.senderid==that.sendmoneyData.senderid && transactiondata.state == 1){


                     console.log(transactiondata.transactionid);
                     that.presentToast("Receiver "+that.sendmoneyData.receivername + " scanned QR code!");
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
