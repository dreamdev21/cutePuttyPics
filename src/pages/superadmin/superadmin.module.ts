import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuperadminPage } from './superadmin';

@NgModule({
  declarations: [
    SuperadminPage,
  ],
  imports: [
    IonicPageModule.forChild(SuperadminPage),
  ],
})
export class SuperadminPageModule {}
