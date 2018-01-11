import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AllTransactionsPage } from './all-transactions';

@NgModule({
  declarations: [
    AllTransactionsPage,
  ],
  imports: [
    IonicPageModule.forChild(AllTransactionsPage),
  ],
})
export class AllTransactionsPageModule {}
