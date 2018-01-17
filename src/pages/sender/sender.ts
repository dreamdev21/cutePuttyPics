import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, LoadingController, ToastController, ActionSheetController } from 'ionic-angular';
import { SendmoneyPage } from '../sendmoney/sendmoney';
import { ReceivemoneyPage } from '../receivemoney/receivemoney';
import { VerifypaypalPage } from '../verifypaypal/verifypaypal';
import { ReportPage } from '../report/report';
import { SettingsPage } from '../settings/settings';
import { LoginPage } from '../login/login';
import { VerifyQRcodePage } from '../verify-q-rcode/verify-q-rcode';
import { User } from '../../models/user';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { Camera } from '@ionic-native/camera';
/**
 * Generated class for the SenderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sender',
  templateUrl: 'sender.html',
})
export class SenderPage {
  loading: Loading;
  public user = {} as User;
  public captureDataUrl: string;
  firestore = firebase.storage();
  public imgsources: any;
  public avatarUrl: any;
  public storageDirectory: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public http: Http,
    private camera: Camera,
    public afd: AngularFireDatabase,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public firebaseProvider: FirebaseProvider,) {
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SenderPage');
  }
 goSendmoney(){
  this.navCtrl.push(SendmoneyPage, {
    user:this.user
  });
 }
 goReceivemoney(){
  this.navCtrl.push(ReceivemoneyPage, {
    user:this.user
  });
 }
 goVerifypaypal(){
  this.navCtrl.push(VerifypaypalPage, {
    user:this.user
  });
 }
 goReports(){
  this.navCtrl.push(ReportPage, {
    user:this.user
  });
 }
 goSettings(){
  this.navCtrl.push(SettingsPage, {
    user:this.user
  });
 }
 goVerifyQRcode(){
   this.navCtrl.push(VerifyQRcodePage,{
     user:this.user
   });
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
          this.updateUser();
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
  updateUser(){
    this.user.avatar = this.avatarUrl;

    var that = this;
    var ref = firebase.database().ref().child('/users');
    var refUserId = ref.orderByChild('id').equalTo(this.user.id);

    refUserId.once('value', function (snapshot) {
      if (snapshot.hasChildren()) {
        snapshot.forEach(
          function (snap) {

              snap.ref.update({
                "avatar": that.avatarUrl
              });

            that.storage.remove('currentUser');
            that.storage.set('currentUser', that.user);
            that.presentToast("Your profile updated successfully!");
            return true;
          });
      } else {
        console.log('wrong');
      }
    });

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
