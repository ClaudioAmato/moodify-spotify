import { ChangeMoodPage } from './change-mood.page';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild([{ path: '', component: ChangeMoodPage }])
  ],
  declarations: [ChangeMoodPage]
})
export class ChangeMoodPageModule { }
