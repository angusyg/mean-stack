import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { LoginModule } from '../login/login.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LoginModule
  ],
  exports: [NavbarComponent],
  declarations: [NavbarComponent]
})
export class NavbarModule { }
