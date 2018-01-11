import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ActionSheetController, Platform, LoadingController, Loading } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
/**
 * Generated class for the CashOutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-out',
  templateUrl: 'cash-out.html',
})
export class CashOutPage {

  public olduserData = {} as User;
  public newuserData = {} as User;
  loading: Loading;
  public toastText: string;
  public user: any;
  public mail: boolean = false;
  public paypal: boolean = false;
  public bank: boolean = false;
  public cashoutMethod: number;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public afd: AngularFireDatabase,
    private alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {
    this.olduserData = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashOutPage');
    console.log(this.olduserData);
    if(this.olduserData.cashoutMethod != 0){
      if (this.olduserData.cashoutMethod == 1) {
        this.mail = true;
        this.paypal = false;
        this.bank = false;
        this.cashoutMethod = 1;
      } else if (this.olduserData.cashoutMethod == 2) {
        this.mail = false;
        this.paypal = true;
        this.bank = false;
        this.cashoutMethod = 2;
      } else if (this.olduserData.cashoutMethod == 3) {
        this.mail = false;
        this.paypal = false;
        this.bank = true;
        this.cashoutMethod = 3;
      }
    }
  }

  radio_select(value) {
    if (value == 'mail') {
      this.mail = true;
      this.paypal = false;
      this.bank = false;
      this.cashoutMethod = 1;
      this.olduserData.cashoutMethod = 1;
    } else if (value == 'paypal') {
      this.mail = false;
      this.paypal = true;
      this.bank = false;
      this.cashoutMethod = 2;
      this.olduserData.cashoutMethod = 2;
    } else if (value == 'bank') {
      this.mail = false;
      this.paypal = false;
      this.bank = true;
      this.cashoutMethod = 3;
      this.olduserData.cashoutMethod = 3;
    }
  }
  updateUser(newuserData) {

    var that = this;
    var ref = firebase.database().ref().child('/users');
    var refUserId = ref.orderByChild('id').equalTo(this.olduserData.id);

    refUserId.once('value', function (snapshot) {
      if (snapshot.hasChildren()) {
        snapshot.forEach(
          function (snap) {
            console.log(snap.val());
            if(that.cashoutMethod == 1){
              that.olduserData.streetAddress1 = newuserData.streetAddress1;
              that.olduserData.streetAddress2 = newuserData.streetAddress2;
              that.olduserData.state = newuserData.state;
              that.olduserData.city = newuserData.city;
              that.olduserData.zipCode = newuserData.zipCode;
              snap.ref.update({
                "streetAddress1": newuserData.streetAddress1,
                "streetAddress2": newuserData.streetAddress2,
                "city": newuserData.city,
                "state": newuserData.state,
                "zipCode": newuserData.zipCode,
                "cashoutMethod": that.cashoutMethod
              });
            } else if (that.cashoutMethod == 2){
              that.olduserData.paypalEmail = newuserData.paypalEmail;
              that.olduserData.paypalPassword = newuserData.paypalPassword;
              snap.ref.update({
                "paypalEmail": newuserData.paypalEmail,
                "paypalPassword": newuserData.paypalPassword,
                "cashoutMethod": that.cashoutMethod
              });
            } else if (that.cashoutMethod == 3) {
              that.olduserData.bankAccountName = newuserData.bankAccountName;
              that.olduserData.bankAccountNumber = newuserData.bankAccountNumber;
              that.olduserData.bankName = newuserData.bankName;
              that.olduserData.bankRouting = newuserData.bankRouting;
              snap.ref.update({
                "bankAccountName": newuserData.bankAccountName,
                "bankName": newuserData.bankName,
                "bankRouting": newuserData.bankRouting,
                "bankAccountNumber": newuserData.bankAccountNumber,
                "cashoutMethod": that.cashoutMethod
              });
            }

            that.presentToast("Your profile updated successfully!");
            return true;

          });
      } else {
        console.log('wrong');
      }
    });

    that.navCtrl.push(SettingsPage, {
      user: that.olduserData
    });

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
