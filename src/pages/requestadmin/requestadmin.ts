import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading,LoadingController  } from 'ionic-angular';
import { User } from "../../models/user";
// import { AngularFireDatabase } from 'angularfire2/database';
// import { Observable } from 'rxjs/Observable';
// import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';


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
  qrData = 'null';
  createdCode = null;
  scannedCode = null;


  public items: Array<{
      fullname: any,
      email: any,
      password: any,
      cardname: any,
      cardnumber: any,
      expirydate: any,
      cvv: any,
     }>
  constructor(

    public navCtrl: NavController,
    public firebaseProvider: FirebaseProvider,
    public http : Http,
    private loadingCtrl: LoadingController ,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner
  ) {
    this.http = http;
  }

  ionViewDidLoad() {
    var text =  'Loading...';
    this.showLoading(text);
    console.log('ionViewDidLoad RequestadminPage');

    console.log('that.items');
    var that = this;
    that.items = [];
    // var starCountRef = firebase.database().ref('users/');
    var query = firebase.database().ref("users").orderByKey();
    console.log(query);
    query.once("value").then(function (snapshot) {

      snapshot.forEach(function (childSnapshot) {
        if(childSnapshot.val().role == 2 && childSnapshot.val().permission == 0){

            that.items.push({
              fullname: childSnapshot.val().fullname,
              email: childSnapshot.val().email,
              password: childSnapshot.val().password,
              cardname: childSnapshot.val().cardname,
              cardnumber: childSnapshot.val().cardnumber,
              expirydate: childSnapshot.val().expirydate,
              cvv: childSnapshot.val().cvv
          });
        }
      });
    });
    that.loading.dismiss();
  }
  createCode(user) {
    console.log(user);
    this.createdCode = btoa(user.email + user.password + user.fullname);
    console.log(this.createdCode);
    var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailqrcode?email=' + user.email + '&username='+ user.fullname +'&qrcode='+ this.createdCode;
    console.log(link);
    this.http.get(link).map(res => res.json())
    .subscribe(data => {
      console.log(data);
    }, error => {
    console.log("Oooops!");
    });
  }

  scanCode() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.scannedCode = barcodeData.text;
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
  showConfirm() {
    console.log();
    let confirm = this.alertCtrl.create({
      title: 'Confirm',
      message: 'Do you want to generate a QR code for this User?',
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
            this.createCode(this.item);
          }
        }
      ]
    });
    confirm.present();
  }
  generateQRcode(user){
    this.item = user;
    this.showConfirm();
  }
}
