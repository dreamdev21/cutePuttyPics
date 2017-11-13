import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UsermanagerPage } from './usermanager';

@NgModule({
  declarations: [
    UsermanagerPage,
  ],
  imports: [
    IonicPageModule.forChild(UsermanagerPage),
  ],
})
export class UsermanagerPageModule {}
