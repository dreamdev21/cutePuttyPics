import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading,LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
@IonicPage()
@Component({
  selector: 'page-requestadmin',
  templateUrl: 'requestadmin.html',
})
export class RequestadminPage {

  loading : Loading;
  public user = {} as User;
  public item = {} as User;
  public users: any;
  adminNote = null;
  createdCode = null;
  public items: Array<{
      id:any,
      fullName: any,
      email: any,
      password: any,
      avatar,
     }>;
  public loginUser;
  constructor(

    public navCtrl: NavController,
    public firebaseProvider: FirebaseProvider,
    public afd: AngularFireDatabase,
    public http : Http,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams,
    public alertCtrl: AlertController
  ) {
    this.http = http;
    this.loginUser = navParams.data;
  }

  ionViewDidLoad() {
    var text =  'Loading...';
    this.showLoading(text);
    console.log('ionViewDidLoad RequestadminPage');
    var that = this;
    that.items = [];
    var query = firebase.database().ref("users").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if(childSnapshot.val().role == 0 && childSnapshot.val().permission == 0){
            that.items.push({
              id:childSnapshot.val().id,
              fullName: childSnapshot.val().fullName,
              email: childSnapshot.val().email,
              password: childSnapshot.val().password,
              avatar:childSnapshot.val().avatar,
          });
        }
      });
    });
    that.loading.dismiss();
  }
  createCode() {
    console.log(this.loginUser);
    console.log(this.user.id.toString());
    this.afd.list('/qrdatas/').push({
      userInfoId:this.user.id,
      type:0,
      verify:0,
      superadminNote:this.adminNote,
    });
    this.createdCode = btoa(this.user.id.toString());
    var link = 'http://localhost:8000/sendhtmlionicmailqrcode?email=' + this.loginUser.email + '&username='+ this.loginUser.fullName +'&qrcode='+ this.createdCode + '&qruseremail=' + this.user.email + '&qrusername=' + this.user.fullName + '&qradminnote=' + this.adminNote;
    console.log(link);
    this.http.get(link).map(res => res.json())
    .subscribe(data => {
      console.log(data);
    }, error => {
    console.log("Oooops!");
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
  showPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'User QR code generate',
      message: "Enter a name for this new user",
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Create',
          handler: data => {
            this.adminNote = data.name;
            this.createCode();
          }
        }
      ]
    });
    prompt.present();
  }
  generateQRcode(item){
    this.user = item;
    this.showPrompt();
  }
}
