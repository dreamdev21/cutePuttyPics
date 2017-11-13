import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerifyQRcodePage } from './verify-q-rcode';

@NgModule({
  declarations: [
    VerifyQRcodePage,
  ],
  imports: [
    IonicPageModule.forChild(VerifyQRcodePage),
  ],
})
export class VerifyQRcodePageModule {}
