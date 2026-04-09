import { ApplicationConfig, importProvidersFrom, APP_ID } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from '@app/interceptors/auth.interceptor';

const navigationErrorHandler = (error: unknown) => {
  console.error('Navigation Error:', error);
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_ID, useValue: 'brain-health-app' },
    provideRouter(
      routes,
      withNavigationErrorHandler(navigationErrorHandler)
    ),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
