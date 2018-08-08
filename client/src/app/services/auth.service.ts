import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '../app-config.module';
import { AppConfig } from '../models/app-config.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

  /**
   * Login function
   * @param  infos login infos login / pas  sword
   */
  login(infos: object): Observable<any> {
    return this.http.post<any>(`${this.config.apiEndpoint}/login`, infos)
      .pipe(
        map(tokens => {
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          return tokens;
        })
      );
  }

  /**
   * Checks if user is authenticated
   * @return true if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
