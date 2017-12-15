import { LoginPage } from '../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { ResetPasswordPage } from '../reset-password/reset-password';

/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  loading: Loading;
  public user = {} as User;
  public validatestate;
  public verifyNumber;
  public verifycodeUserinput;
  public userId;
  public data: any = {};
  constructor(public http: Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public firebaseProvider: FirebaseProvider, ) {
    this.http = http;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }
  changePassword(data){
    console.log(data);
    if(!data.email){
      this.showAlert("Please enter your Email");
    }else{
      // if(data.password != data.confirmpassword){
      //   this.showAlert("Password does not match");
      // }else{
      //   if (data.password.length < 6){
      //     this.showAlert("Password length must be at least 6 letter.");
      //   }else{
          this.validatestate = 0;
          var that = this;
          var query = firebase.database().ref("users").orderByKey();
          query.once("value").then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              if (childSnapshot.val().email == that.data.email) {
                that.validatestate = 1;
                that.user.id = childSnapshot.val().id;
                that.user.permission = childSnapshot.val().permission;
                that.user.qrRequested = childSnapshot.val().qrRequested;
                that.user.avatar = childSnapshot.val().avatar;
                that.user.fullName = childSnapshot.val().fullName;
                that.user.password = childSnapshot.val().password;
                that.user.email = childSnapshot.val().email;
                that.user.birthday = childSnapshot.val().birthday;
                that.user.gender = childSnapshot.val().gender;
                that.user.role = childSnapshot.val().role;
                that.user.paypalEmail = childSnapshot.val().paypalEmail;
                that.user.paypalPassword = childSnapshot.val().paypalPassword;
                that.user.paypalVerifyState = childSnapshot.val().paypalVerifyState;
                that.user.groupId = childSnapshot.val().groupId;
                console.log(that.user);
                that.sendMail();
              }
            });
            if(that.validatestate == 0){
              that.showAlert("Email info is wrong");
            }
          });
        }
    //   }
    // }
  }
  sendMail(){
    this.verifyNumber = Math.floor(Math.random() * 1000000);
    var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailforgotpassword?email=' + this.user.email + '&username=' + this.user.fullName + '&verifycode=' + this.verifyNumber;
    console.log(link);
    this.http.get(link).map(res => res.json())
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log("Oooops!");
      });
  }
  verifycode(code){
    if(code == this.verifyNumber){
      this.navCtrl.push(ResetPasswordPage,{
        user:this.user
      });
    }else{
      this.showAlert("Verifycode invalid");
    }
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
