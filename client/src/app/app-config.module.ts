import { NgModule, InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';
import { AppConfig } from './models/app-config.model';

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
export const APP_ENV_CONFIG: AppConfig = {
  apiEndpoint: environment.apiEndpoint
};

@NgModule({
  providers: [{
    provide: APP_CONFIG,
    useValue: APP_ENV_CONFIG
  }]
})
export class AppConfigModule { }
