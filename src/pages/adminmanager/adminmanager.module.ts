import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminmanagerPage } from './adminmanager';
import { RegisteredadminPage } from '../registeredadmin/registeredadmin';
import { RequestadminPage } from '../requestadmin/requestadmin';

@NgModule({
  declarations: [
    AdminmanagerPage,
    RegisteredadminPage,
    RequestadminPage
  ],
  imports: [
    IonicPageModule.forChild(AdminmanagerPage),
  ],
})
export class AdminmanagerPageModule {}
