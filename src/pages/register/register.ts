import { LoginPage } from '../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { User } from "../../models/user";
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { Camera } from '@ionic-native/camera';

import { ActionSheetController, Platform } from 'ionic-angular';
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
  public toastText: string;
  public imgsources: any;
  public avatarUrl = "https://firebasestorage.googleapis.com/v0/b/tipqr-164a4.appspot.com/o/images%2Favatar.png?alt=media&token=aa3bc5c5-aeeb-43de-9de4-35c07c50d050";
  public captureDataUrl: string;
  firestore = firebase.storage();
  public storageDirectory: string;

  constructor(
    public http : Http,
    private camera: Camera,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController ,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
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
                user.avatar = that.avatarUrl;
                user.permission = 0;
                user.qrRequested = 0;
                user.groupId = 0;
                user.role = 0;
                user.qrName = "";
                user.qrId = null;
                user.groupName = "";
                user.address = "";
                user.cashoutMethod = 0;
                user.streetAddress1 = "";
                user.streetAddress2 = "";
                user.city = "";
                user.zipCode = "";
                user.paypalEmail = "";
                user.paypalPassword = "";
                user.bankAccountName = "";
                user.bankAccountNumber = "";
                user.bankName = "";
                user.bankRouting = "";
                user.bankRoutingNumber = "";
                user.state = "";
                that.afd.list('/users/').push(user);
                var query = firebase.database().ref("users").orderByKey();
                query.once("value").then(function (snapshot) {
                  snapshot.forEach(function (childSnapshot) {
                        if (childSnapshot.val().role == 3){
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
        }
      }
    }
    this.loading.dismiss();
    return validatestate;
  }
  public presentActionSheet() {

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);

          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }]
    });
    actionSheet.present();
  }
  public takePicture(sourceType) {

    var options = {
      quality: 100,
      allowEdit: true,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    this.camera.getPicture(options).then((imagePath) => {
      this.captureDataUrl = 'data:image/jpeg;base64,' + imagePath;
      this.uploadImage();
    }, (err) => {
      this.presentToast('Selecting image canceled.');
    });
  }
  public uploadImage() {

    if (this.captureDataUrl != undefined) {

      let storageRef = firebase.storage().ref();
      var filename = Math.floor(Date.now() / 1000);

      const imageRef = storageRef.child(`images/${filename}.jpg`);

      this.loading = this.loadingCtrl.create({
        content: 'Uploading...',
      });
      this.loading.present();

      imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {

        this.loading.dismissAll()
        this.presentToast('Upload Success!');
        this.firestore.ref().child(`images/${filename}.jpg`).getDownloadURL().then((url) => {
          this.avatarUrl = url;
        })

      }, (err) => {
        this.loading.dismissAll();
        this.presentToast('Upload Failed!');
      });
    }
    else {
      this.showAlert('Please select an image.');
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
}
