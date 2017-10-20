import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import { sendmoneyData } from '../../models/sendmoneyData';

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
  public receivemethodtext:any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendmoneyPage');
  }
  sendmoneySelect(money){
    this.sendmoneyData.sendmoney = money;
  }
  sendMoney(sendmoneyData){
    console.log(this.sendmoneyData.receiver);
    if(this.sendmoneyData.sendmoney == 0 || this.sendmoneyData.sendmoney == null){
      this.showAlert("Please enter money!");
    }else if(!this.sendmoneyData.receiver){
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
            // this.scanCode();
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
}
