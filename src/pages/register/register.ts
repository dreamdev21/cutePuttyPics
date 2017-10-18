import { LoginPage } from '../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, MenuController,LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http, Headers } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

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
    private barcodeScanner: BarcodeScanner,
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
        // var text =  'Checking...';
        // this.showLoading(text);
        console.log('validate true');
        var that = this;
        var starCountRef = firebase.database().ref('users/');
        var query = firebase.database().ref("users").orderByKey();
        console.log(query);
        query.once("value").then(function (snapshot) {

          snapshot.forEach(function (childSnapshot) {
            if(checkstate) {
              if (childSnapshot.val().email == user.email){
                that.showAlert("Email already exist!");
                checkstate = false;
              }
              if (childSnapshot.val().fullname == user.fullname){
                that.showAlert("Name already exist!");
                checkstate = false;
              }
            }
            });
            // that.loading.dismiss();
            if(checkstate){
              try{
                if(user.role == 2){
                  user.permission = 0;
                  that.afd.list('/users/').push(user);
                  console.log(user);
                  var starCountRef = firebase.database().ref('users/');
                  var query = firebase.database().ref("users").orderByKey();

                  query.once("value").then(function (snapshot) {

                    snapshot.forEach(function (childSnapshot) {

                          if (childSnapshot.val().role == 3){
                            console.log(childSnapshot.val().fullname);
                            var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmail?supermailaddress=' + childSnapshot.val().email + '&supername='+ childSnapshot.val().fullname +'&infoadminemail='+ user.email + '&infoadminusername='+ user.fullname + '&infoadminpassword='+ user.password + '&infoadmincardholdername='+ user.cardname+ '&infoadmincardnumber='+ user.cardnumber+ '&infoadmincardexpirydate='+ user.expirydate+ '&infoadmincardcvv='+ user.cvv;
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
                that.showAlertSuccess("You are registered");
                that.scanCode();
                }else{
                  user.permission = 1;
                  that.afd.list('/users/').push(user);
                  that.navCtrl.push(LoginPage, {
                  });
                }

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
                return true;
              });
              this.navCtrl.push(LoginPage, {
              });
        } else {
          console.log('wrong');
        }
      });
      this.scannedCode = "QR code correct!";
      this.navCtrl.push(LoginPage, {
      });
      }else{
        this.scannedCode = "QR code invalid!";
      }
    }, (err) => {
        console.log('Error: ', err);
  });
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

  validateUser(user){
    var text =  'Validating...';
    this.showLoading(text);

    var validatestate = true;
    if (!user.fullname){
      this.showAlert("Please enter your fullname");
      validatestate = false;
    }
    if (!user.password || user.password.length<6){
      this.showAlert("Password length must be at least 6 letter.");
      validatestate = false;
    }
    if (!user.email){
      this.showAlert("Please enter your email");
      validatestate = false;
    }else{
      var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (!filter.test(user.email)) {
        this.showAlert("Please enter your valid email");
        validatestate = false;
      }
    }
    if (!user.cardname){
      this.showAlert("Please enter your cardname");
      validatestate = false;
    }
    if (!user.cardnumber){
      this.showAlert("Please enter your cardnumber");
      validatestate = false;
    }
    if (!user.role){
      this.showAlert("Please select your role");
      validatestate = false;
    }
    console.log(validatestate);
    this.loading.dismiss();
    return validatestate;
  }
}
