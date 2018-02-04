import { VerifyQRcodePage } from '../verify-q-rcode/verify-q-rcode';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { RegisterPage} from '../register/register';
import { SuperadminPage } from '../superadmin/superadmin';
import { SenderPage } from '../sender/sender';
import { SendmoneyPage } from '../sendmoney/sendmoney';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

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
  forgotpasswordpage = ForgotPasswordPage;
  scannedCode = null;

  loading:any;
  public user = {} as User;
  public users: any;
  public validatestate;
  public checkstate;
  public permission;

  constructor(
    public http : Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    private storage : Storage,
    ) {
  }

  async Login(user: User) {
    if(this.validateUser(user)){
      var that = this;
      var query = firebase.database().ref("users").orderByKey();

      that.checkstate = true;
      query.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if(that.checkstate){
              if (childSnapshot.val().email == user.email){
                if (childSnapshot.val().password == user.password){
                  that.checkstate = false;
                  that.user.id = childSnapshot.val().id;
                  that.user.permission = childSnapshot.val().permission;
                  that.user.qrRequested = childSnapshot.val().qrRequested;
                  that.user.avatar = childSnapshot.val().avatar;
                  that.user.fullName = childSnapshot.val().fullName;
                  that.user.password = childSnapshot.val().password;
                  that.user.email = childSnapshot.val().email;
                  that.user.role = childSnapshot.val().role;
                  that.user.paypalEmail = childSnapshot.val().paypalEmail;
                  that.user.paypalPassword = childSnapshot.val().paypalPassword;
                  that.user.groupId = childSnapshot.val().groupId;
                  that.user.address = childSnapshot.val().address;
                  that.user.cashoutMethod = childSnapshot.val().cashoutMethod;
                  that.user.streetAddress1 = childSnapshot.val().streetAddress1;
                  that.user.streetAddress2 = childSnapshot.val().streetAddress2;
                  that.user.state = childSnapshot.val().state;
                  that.user.city = childSnapshot.val().city;
                  that.user.zipCode = childSnapshot.val().zipCode;

                  that.user.bankAccountName = childSnapshot.val().bankAccountName;
                  that.user.bankAccountNumber = childSnapshot.val().bankAccountNumber;
                  that.user.bankName = childSnapshot.val().bankName;
                  that.user.bankRouting = childSnapshot.val().bankRouting;
                  that.goLogin(user);
                  that.storage.set('currentUser',that.user);
                }else{
                  that.showAlert("Password is incorrect!");
                  that.checkstate = false;
                }
              }
            }
          });
          if(that.checkstate){
            var text = "The email address or the password entered seems to be incorrect.";
            that.showAlert(text);
          }
      });
    }
  }

  validateUser(user){
    this.validatestate = true;
    var text =  'Checking...';
    this.showLoading(text);
    if (!user.email){
      this.showAlert("Please enter your email");
      this.validatestate = false;
    }else{
      if (!user.password || user.password.length<6){
        this.showAlert("Password length must be at least 6 letter.");
        this.validatestate = false;
      }
    }
    this.loading.dismiss();
    return this.validatestate;

  }
  goLogin(user){
    if(user.role == 3){
      this.navCtrl.push(SuperadminPage, {
        user: user
      });
    }else {
        if (this.user.permission == 0){
          this.navCtrl.push(SendmoneyPage, {
            user: user
          });
      }else{
        this.navCtrl.push(SenderPage, {
          user: user
        });
      }

    }
  }
  goRegister(){
    this.navCtrl.push(RegisterPage, {
  });
  }
  goForgotPassword(){
    this.navCtrl.push(ForgotPasswordPage, {
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
}
