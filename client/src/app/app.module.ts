import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppConfigModule } from './app-config.module';
import { NavbarModule } from './navbar/navbar.module';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    ToastrModule.forRoot(),
    AppConfigModule,
    AppRoutingModule,
    NavbarModule,
    LoginModule,
    SignupModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
