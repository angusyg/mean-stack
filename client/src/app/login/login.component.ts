import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { };

  ngOnInit() {
    this.loginForm = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    this.authService.login(this.loginForm.value)
      .subscribe(
        user => {
          this.toastr.success('Content de vous revoir, Black', 'Bienvenue');
          this.router.navigate(['']);
        },
        err => console.log('ERRRR', err)
      );
  }

}
