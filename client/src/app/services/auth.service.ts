import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  constructor() { }

  isAuthenticated(): boolean {
    console.log('DDDDDDDDDDDDDDDDDDD');
    const token = localStorage.getItem('token');
    return false;
  }
}
