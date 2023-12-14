import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Provider, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, catchError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly toast = inject(ToastController);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('intercepting request', req);
    return next.handle(req).pipe(
      catchError(async (err) => {
        console.log(err);

        if (!(err instanceof HttpErrorResponse)) {
          throw err;
        }

        let message = err.error.message;
        if (err.status === 0) {
          message =
            'The server could not be reached. Check your connection and try again.';
        }

        const toast = await this.toast.create({
          message,
          duration: 3000,
          position: 'bottom',
          color: 'danger',
        });

        toast.present();
        throw err;
      })
    );
  }
}

export const ERROR_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
};
