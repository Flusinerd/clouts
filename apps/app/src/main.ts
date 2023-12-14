import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideQueryDevTools } from '@ngneat/query-devtools';

import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ERROR_INTERCEPTOR_PROVIDER } from './app/common/interceptors/error-interceptor';
import { environment } from './environments/environment';

defineCustomElements(window);
if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes),
    ERROR_INTERCEPTOR_PROVIDER,
    provideHttpClient(withInterceptorsFromDi()),
    environment.production ? [] : provideQueryDevTools(),
  ],
});
