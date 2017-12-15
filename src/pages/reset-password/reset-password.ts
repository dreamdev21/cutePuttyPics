import { LoginPage } from '../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';

/**
 * Generated class for the ResetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {

  loading: Loading;
  public user = {} as User;
  public data: any = {};
  constructor(
    public http: Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public firebaseProvider: FirebaseProvider, ) {
    this.http = http;
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPasswordPage');
  }
  changePassword(data){
     if(data.password != data.confirmpassword){
        this.showAlert("Password does not match");
      }else{
        if (data.password.length < 6){
          this.showAlert("Password length must be at least 6 letter.");
        }else{
            var that = this;
            var ref = firebase.database().ref().child('/users');
            var refUserId = ref.orderByChild('id').equalTo(that.user.id);
            refUserId.once('value', function (snapshot) {
              if (snapshot.hasChildren()) {
                snapshot.forEach(
                  function (snap) {
                    console.log(snap.val());
                    snap.ref.update({
                        "password": that.data.password
                    });
                    that.presentToast("Password changed successfully!");
                    that.navCtrl.push(LoginPage,{});
                    return true;
                  });
              } else {
                console.log('wrong');
              }
            });
          }
        }
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
      title: 'Password Changed Successfully!',
      subTitle: text,
      buttons: [{
        text: "OK",
      }]
    });
    alert.present();
  }
}
