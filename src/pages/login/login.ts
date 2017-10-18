import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading,LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
// import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { RegisterPage} from '../register/register';
import { SuperadminPage } from '../superadmin/superadmin'

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

  loading:any;
  public user = {} as User;
  public users: any;
  public validatestate;
  public checkstate;
  public userpermission;

  constructor(
    private afAuth: AngularFireAuth,
    public http : Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,) {
  }

  async Login(user: User) {
    console.log(user);
    if(this.validateUser(user)){
      var that = this;
      var starCountRef = firebase.database().ref('users/');
      var query = firebase.database().ref("users").orderByKey();

      that.checkstate = true;
      var userpermission = 0;
      query.once("value").then(function (snapshot) {

        snapshot.forEach(function (childSnapshot) {
            if(that.checkstate){
              if (childSnapshot.val().email == user.fullname || childSnapshot.val().fullname == user.fullname){
                that.checkstate = false;
                if (childSnapshot.val().password == user.password){
                  that.userpermission = childSnapshot.val().permission;
                  if(that.userpermission == "0"){
                    that.showAlert("You have no permission yet!");
                  }else{
                    // this.goLogin(user);
                    that.navCtrl.push(SuperadminPage, {
                    });
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
    if(user.role = 3){
      this.navCtrl.push(SuperadminPage, {
      });
    }
    // this.showAlertSuccess("Welcome back" + user.fullname);
  }
  goRegister(){
    this.navCtrl.push(RegisterPage, {
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
}
