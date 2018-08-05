import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [RouterModule],
  declarations: [LoginComponent]
})
export class LoginModule { }
