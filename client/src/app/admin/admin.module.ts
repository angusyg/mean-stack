import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PostProfileComponent } from './post-profile/post-profile.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent,
    PostProfileComponent,
    ViewProfileComponent
  ]
})
export class AdminModule { }
