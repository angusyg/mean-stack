import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostProfileComponent } from './post-profile/post-profile.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'post', component: PostProfileComponent },
  { path: 'view', component: ViewProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
