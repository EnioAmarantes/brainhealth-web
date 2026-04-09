import { ApplicationConfig, importProvidersFrom, APP_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from '@app/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_ID, useValue: 'brain-health-app' },
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
