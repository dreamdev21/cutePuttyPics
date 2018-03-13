import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { SuperadminPage } from '../superadmin/superadmin';
import { User } from '../../models/user';
/**
 * Generated class for the TransactionDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-transaction-detail',
  templateUrl: 'transaction-detail.html',
})
export class TransactionDetailPage {
  public user = {} as User;
  public transaction = {
    date: [],
    amount: [],
    state: [],
    senderAvatar: [],
    senderName: [],
    receiverAvatar: [],
    receiverName: [],
    receiverCashoutMethod: [],
    receiverStreetAddress1: [],
    receiverStreetAddress2: [],
    receiverCity: [],
    receiverState: [],
    receiverZipCode: [],
    receiverPaypalEmail: [],
    receiverPaypalPassword: [],
    receiverBankAccountName: [],
    receiverBankName: [],
    receiverBankAccountNumber: [],
    receiverBankRouting: [],
    receiverBankRoutingNumber:[]
  };
  public transaction_Id : number;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public afd: AngularFireDatabase,
    public toastCtrl: ToastController,
    public firebaseProvider: FirebaseProvider
  ) {
    this.transaction = navParams.get("transaction");
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TransactionDetailPage');
    console.log(this.transaction);
  }
  goMakeComplete(){
    var that = this;
    var ref = firebase.database().ref().child('/transactions');
    var refUserId = ref.orderByChild('transactionid').equalTo(Number(that.transaction.date));

    refUserId.once('value', function (snapshot) {
      if (snapshot.hasChildren()) {
        snapshot.forEach(
          function (snap) {
            console.log(snap.val());
            snap.ref.update({
              "state":1
            });
            that.presentToast("Transaction Status Updated Successfully!");
            return true;
          });
      } else {
        console.log('wrong');
      }
    });

    that.navCtrl.push(SuperadminPage,{
      user:that.user
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
