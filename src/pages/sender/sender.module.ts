import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SenderPage } from './sender';

@NgModule({
  declarations: [
    SenderPage,
  ],
  imports: [
    IonicPageModule.forChild(SenderPage),
  ],
})
export class SenderPageModule {}
