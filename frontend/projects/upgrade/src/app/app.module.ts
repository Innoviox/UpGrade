import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { environment } from '../environments/environment';
import { ENV, Environment, RuntimeEnvironmentConfig } from '../environments/environment-types';
import { CloseModalInterceptor } from './core/http-interceptors/close-modal.interceptor';

export const getEnvironmentConfig = (http: HttpClient, env: Environment) => {
  // in non-prod build, all env vars can be provided on .environment.ts,
  // so skip fetch
  if (!environment.production || (environment.apiBaseUrl && environment.googleClientId)) {
    return () => Promise.resolve();
  }

  // in a prod build, we currently need to fetch environment.json at runtime
  // to provide apiBaseUr, googleClientId, featureFlagNavToggle and withinSubjectExperimentSupportToggle
  return () =>
    http
      .get('/environment.json')
      .toPromise()
      .then((config: RuntimeEnvironmentConfig) => {
        env.apiBaseUrl = config.endpointApi || config.apiBaseUrl;
        env.googleClientId = config.gapiClientId || config.googleClientId;
        env.featureFlagNavToggle = config.featureFlagNavToggle ?? env.featureFlagNavToggle ?? false;
        env.withinSubjectExperimentSupportToggle =
          config.withinSubjectExperimentSupportToggle ?? env.withinSubjectExperimentSupportToggle ?? false;
        env.errorLogsToggle = config.errorLogsToggle ?? env.errorLogsToggle ?? false;
        env.metricAnalyticsExperimentDisplayToggle =
          config.metricAnalyticsExperimentDisplayToggle ?? env.metricAnalyticsExperimentDisplayToggle ?? false;
      })
      .catch((error) => {
        console.log({ error });
      });
};

@NgModule({
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,
    // global configuration for notification
    SimpleNotificationsModule.forRoot({
      position: ['bottom', 'center'],
      timeOut: 4000,
      showProgressBar: false,
      pauseOnHover: true,
      clickToClose: false,
    }),

    // core & shared
    CoreModule,
    SharedModule,

    // app
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: ENV, useValue: environment },
    {
      provide: APP_INITIALIZER,
      useFactory: getEnvironmentConfig,
      multi: true,
      deps: [HttpClient, ENV],
    },
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
