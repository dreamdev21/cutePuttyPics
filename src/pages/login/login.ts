import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
// import { Observable } from 'rxjs/Observable';
// import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { RegisterPage} from '../register/register';
import { SuperadminPage } from '../superadmin/superadmin';
import { SenderPage } from '../sender/sender';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  registerpage = RegisterPage;
  superadminpage = SuperadminPage;
  senderpage = SenderPage;
  scannedCode = null;

  loading:any;
  public user = {} as User;
  public users: any;
  public validatestate;
  public checkstate;
  public userpermission;

  constructor(
    // private afAuth: AngularFireAuth,
    public http : Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    private barcodeScanner: BarcodeScanner,) {
  }

  async Login(user: User) {
    if(this.validateUser(user)){
      var that = this;
      // var starCountRef = firebase.database().ref('users/');
      var query = firebase.database().ref("users").orderByKey();

      that.checkstate = true;
      // var userpermission = 0;
      query.once("value").then(function (snapshot) {

        snapshot.forEach(function (childSnapshot) {
            if(that.checkstate){
              if (childSnapshot.val().email == user.fullname || childSnapshot.val().fullname == user.fullname){
                that.checkstate = false;
                if (childSnapshot.val().password == user.password){

                  that.userpermission = childSnapshot.val().permission;
                  that.user.id = childSnapshot.val().id;
                  that.user.avatar = childSnapshot.val().avatar;
                  that.user.fullname = childSnapshot.val().fullname;
                  that.user.password = childSnapshot.val().password;
                  that.user.email = childSnapshot.val().email;
                  that.user.cardnumber = childSnapshot.val().cardnumber;
                  that.user.cardname = childSnapshot.val().cardname;
                  that.user.cvv = childSnapshot.val().cvv;
                  that.user.expirydate = childSnapshot.val().expirydate;
                  that.user.birthday = childSnapshot.val().birthday;
                  that.user.gender = childSnapshot.val().gender;
                  that.user.role = childSnapshot.val().role;
                  that.user.paypalemail = childSnapshot.val().paypalemail;
                  that.user.paypalpassword = childSnapshot.val().paypalpassword;

                  if(that.userpermission == "0" && that.user.role == 2){

                    that.showConfirm();
                  }else{
                    that.goLogin(user);
                  }
                }else{
                  that.showAlert("Password is incorrect!");
                }
              }
            }
            console.log(that.checkstate);
          });
          if(that.checkstate){
            var text = "Username or email are incorrect!";
            that.showAlert(text);
          }
      });
    }
  }

  validateUser(user){
    this.validatestate = true;
    var text =  'Checking...';
    this.showLoading(text);
    if (!user.fullname){
      this.showAlert("Please enter your username or email");
      this.validatestate = false;
    }

    if (!user.password || user.password.length<6){
      this.showAlert("Password length must be at least 6 letter.");
      this.validatestate = false;
    }
    this.loading.dismiss();
    return this.validatestate;

  }
  goLogin(user){
      if(user.role == 3){
      this.navCtrl.push(SuperadminPage, {
      });
    }else if(user.role == 2) {
      this.showAlertSuccess("Welcome back  admin " + this.user.fullname);
    }else {
      this.navCtrl.push(SenderPage, {
        user:user
      });
    }
  }
  goRegister(){
    this.navCtrl.push(RegisterPage, {
  });
  }
  scanCode() {
    this.barcodeScanner.scan().then(barcodeData => {
      var scanqrcode = barcodeData.text;
      var qrdecode = this.user.email + this.user.password + this.user.fullname;
      if(atob(scanqrcode) == qrdecode){
      var that = this;
      var ref = firebase.database().ref().child('users');
      var refUserId = ref.orderByChild('email').equalTo(this.user.email);
      refUserId.once('value', function(snapshot) {
        if (snapshot.hasChildren()) {
            snapshot.forEach(
              function(snap){
                console.log(snap.val());
                snap.ref.update({
                  'permission':1
                });
                that.goLogin(snap);
                return true;
            });
        } else {
          console.log('wrong');
        }
      });
      this.scannedCode = "QR code correct!";
      }else{
        this.scannedCode = "QR code invalid!";
      }
    }, (err) => {
        console.log('Error: ', err);
  });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  showLoading(text) {
    this.loading = this.loadingCtrl.create({
      content: text,
      dismissOnPageChange: true,
      showBackdrop: false
    });
    this.loading.present();
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
  showConfirm() {
    console.log();
    let confirm = this.alertCtrl.create({
      title: 'Confirm',
      message: 'You have no permission yet.Do you scan QR code now?',
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
            this.scanCode();
          }
        }
      ]
    });
    confirm.present();
  }
}
