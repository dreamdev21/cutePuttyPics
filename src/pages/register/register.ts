import { LoginPage } from '../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})

export class RegisterPage {

  loading : Loading;

  public user = {} as User;
  public users: any;
  public validatestate;
  public data:any = {};
  scannedCode = null;

  constructor(
    public http : Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,) {
      this.http = http;
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }
  async register(user: User) {
    try {
      var checkstate = true;

      if(this.validateUser(user)){
        console.log('validate true');
        var that = this;
        var query = firebase.database().ref("users").orderByKey();
        query.once("value").then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            if(checkstate) {
              if (childSnapshot.val().email == user.email){
                that.showAlert("Email already exist!");
                checkstate = false;
              }
              if (childSnapshot.val().fullName == user.fullName){
                that.showAlert("Name already exist!");
                checkstate = false;
              }
            }
            });
            if(checkstate){
              try{
                var now = new Date();
                user.id = now.getTime();
                user.avatar = "assets/avatar/avatar0.png";
                user.birthday = now;
                user.gender = 0;
                user.paypalVerifyState = 0;
                user.permission = 0;
                user.qrRequested = 0;
                user.groupId = 0;
                user.role = 0;
                user.qrName = null;
                user.qrId = null;
                user.groupName = null;
                that.afd.list('/users/').push(user);
                var query = firebase.database().ref("users").orderByKey();
                query.once("value").then(function (snapshot) {
                  snapshot.forEach(function (childSnapshot) {
                        if (childSnapshot.val().role == 3){
                          console.log(childSnapshot.val().fullName);
                          var link = 'http://tipqrbackend.com.candypickers.com/sendsuperadminuserregisterconfirm?supermailaddress=' + childSnapshot.val().email + '&supername='+ childSnapshot.val().fullName +'&usermail='+ user.email + '&username='+ user.fullName + '&userpassword='+ user.password;
                          console.log(link);
                          that.http.get(link).map(res => res.json())
                          .subscribe(data => {
                            console.log(data);
                          }, error => {
                          console.log("Oooops!");
                          });
                        }
                    });
                });
                that.showAlertSuccess("You are successfully registered to the app.");
                that.navCtrl.push(LoginPage, {
                });
              }
              catch(e){
                console.error(e);
                that.showAlert("Something wrong");
              }
            }
        });
      }
    }
    catch (e) {
      console.error(e);
      var text = "Something wrong";
      this.showAlert(text);
    }
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
      title: 'Registered Successfully!',
      subTitle: text,
      buttons: [{
        text: "OK",
      }]
    });
    alert.present();
  }

  validateUser(user){
    var text =  'Validating...';
    this.showLoading(text);

    var validatestate = true;
    if (!user.fullName){
      this.showAlert("Please enter your fullName");
      validatestate = false;
    }else{
      if (!user.password || user.password.length<6){
        this.showAlert("Password length must be at least 6 letter.");
        validatestate = false;
      }else{
        if (!user.email){
          this.showAlert("Please enter your email");
          validatestate = false;
        }else{
          if (!user.paypalEmail){
            this.showAlert("Please enter your Paypal email");
            validatestate = false;
          }

        }
      }
    }
    this.loading.dismiss();
    return validatestate;
  }
}
