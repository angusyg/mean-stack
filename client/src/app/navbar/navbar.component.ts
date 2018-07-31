import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  private logged: Object[] = [{
    title: 'Pronostiques',
    routerLink: 'home'
  }, {
    title: 'Classement',
    routerLink: 'ranking'
  }, {
    title: 'Bonus',
    routerLink: 'bonus'
  }];

  public links: Object[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.links = this.logged;
    } else {
      this.links = [];
    }
  }

}
