import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestadminPage } from './requestadmin';

@NgModule({
  declarations: [
    RequestadminPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestadminPage),
  ],
})
export class RequestadminPageModule {}
