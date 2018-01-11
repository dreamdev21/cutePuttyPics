import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingTransactionsPage } from './pending-transactions';

@NgModule({
  declarations: [
    PendingTransactionsPage,
  ],
  imports: [
    IonicPageModule.forChild(PendingTransactionsPage),
  ],
})
export class PendingTransactionsPageModule {}
