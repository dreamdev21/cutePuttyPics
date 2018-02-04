import { NgZone,Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController  } from 'ionic-angular';
import { User } from '../../models/user';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { SenderPage } from '../sender/sender';
import { CashOutPage } from '../cash-out/cash-out';

import { ActionSheetController, Platform, LoadingController, Loading } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';


declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {

  public olduserData= {} as User;
  public newuserData= {} as User;
  loading: Loading;
  public imgsources: any;
  public captureDataUrl : string;
  firestore = firebase.storage();
  public storageDirectory : string;
  public toastText:string;
  public user:any;
  public transactions:any;
  public transaction = {
    avatar:[],
    name:[],
    date:[],
    amount:[],
  };
  public transactiontotalmoney:number;
  public admincheck:number;
  constructor(
    public zone: NgZone,
    private camera: Camera,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public http : Http,
    public afd: AngularFireDatabase,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private storage: Storage,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public firebaseProvider: FirebaseProvider,) {
      this.olduserData = navParams.get("user");
      this.http = http;
      this.platform.ready().then(() => {
        if(!this.platform.is('cordova')) {
            return false;
        }

        if (this.platform.is('ios')) {
            this.storageDirectory = cordova.file.dataDirectory;
        }
        else if(this.platform.is('android')) {
            this.storageDirectory = cordova.file.externalApplicationStorageDirectory;
        }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
    if(this.olduserData.role == 3){
      this.admincheck = 1;
    }else{
      this.admincheck = 0;
    }
    var that = this;
    that.transactiontotalmoney = 0;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          if(that.olduserData.role == 1){
            if (childSnapshot.val().senderid == that.olduserData.id && childSnapshot.val().transactionstate == 1) {
              that.transactiontotalmoney += Number(childSnapshot.val().sendmoney);
            }
          }else if(that.olduserData.role == 0){
            if (childSnapshot.val().receiverid == that.olduserData.id && childSnapshot.val().transactionstate == 1) {
              that.transactiontotalmoney += Number(childSnapshot.val().sendmoney);
            }
          }else{

          }

        });
    });
  }
  updateUser(newuserData){
    if(newuserData.fullName){
      if(newuserData.password){
        if(newuserData.email){
            this.olduserData.fullName = newuserData.fullName;
            this.olduserData.password = newuserData.password;
            this.olduserData.email = newuserData.email;
            if(newuserData.address){
              this.olduserData.address = newuserData.address;
            }
            var that= this;
            var ref = firebase.database().ref().child('/users');
            var refUserId = ref.orderByChild('id').equalTo(this.olduserData.id);

            refUserId.once('value', function(snapshot) {
              if (snapshot.hasChildren()) {
                  snapshot.forEach(
                    function(snap){
                      if(newuserData.address){
                        snap.ref.update({
                          "fullName": newuserData.fullName,
                          "email": newuserData.email,
                          "password": newuserData.password,
                          "avatar": newuserData.avatar,
                          "address": newuserData.address
                        });
                      }else{
                        snap.ref.update({
                          "fullName": newuserData.fullName,
                          "email": newuserData.email,
                          "password": newuserData.password,
                          "avatar": newuserData.avatar
                        });
                      }
                      that.storage.remove('currentUser');
                      that.storage.set('currentUser', that.olduserData);
                      that.presentToast("Your profile updated successfully!");
                      return true;
                    });
              } else {
                console.log('wrong');
              }
            });

            that.navCtrl.push(SenderPage, {
              user: that.olduserData
            });


        }else{
          this.showAlert("Please enter your email");
        }
      }else{
        this.showAlert("Please enter your password");
      }
    }else{
      this.showAlert("Please enter your fullname");
    }

  }
  showAlert(toastText) {
      let message = toastText;
      let alert = this.alertCtrl.create({
        title: 'Warning!',
        subTitle: " " +message +" ",
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
        allowEdit:true,
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

  if(this.captureDataUrl != undefined){

      let storageRef = firebase.storage().ref();
      var filename = Math.floor(Date.now() / 1000);

      const imageRef = storageRef.child(`images/${filename}.jpg`);

      this.loading = this.loadingCtrl.create({
          content: 'Uploading...',
      });
      this.loading.present();

      imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL).then((snapshot)=> {

          this.loading.dismissAll()
          this.presentToast('Upload Success!');
          this.firestore.ref().child(`images/${filename}.jpg`).getDownloadURL().then((url) => {
            this.olduserData.avatar = url;
            this.updateUser(this.olduserData);
        })

      }, (err) => {
          this.loading.dismissAll();
          this.presentToast('Upload Failed!');
      });
    }
    else{
        this.showAlert('Please select an image.');
    }
  }
  goContactUs(userdata){
    this.presentPrompt();
  }
  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Please message here.',
      inputs: [
        {
          name: 'message',
          placeholder: 'Message'
        },

      ],

      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            var that = this;
            var query = firebase.database().ref("users").orderByKey();
            query.once("value").then(function (snapshot) {
              snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().role == 3) {
                  var link = 'http://tipqrbackend.com.candypickers.com/sendhtmlionicmailsupportemail?email=' + childSnapshot.val().email + '&username=' + childSnapshot.val().fullName + '&qrName=' + data.message + '&qrUserName=' + that.olduserData.fullName + '&qrUserEmail=' + that.olduserData.email;
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
          }
        }
      ]
    });
    alert.present();
  }
  goLogout() {
    this.storage.remove('currentUser');
    this.navCtrl.push(LoginPage);
  }
  goCashout(){
    this.navCtrl.push(CashOutPage, {
      user: this.olduserData
    });
  }
}
