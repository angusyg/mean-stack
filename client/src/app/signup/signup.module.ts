import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignupComponent } from './signup.component';

const routes: Routes = [
  { path: '', component: SignupComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    FormsModule
  ],
  exports: [SignupComponent],
  declarations: [SignupComponent]
})
export class SignupModule { }
