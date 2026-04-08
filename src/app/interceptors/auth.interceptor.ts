import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { LoadingService } from '@app/services/loading.service';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);
  const token = authService.getToken();
  
  // Debug: Log do token
  console.log('[AuthInterceptor] === REQUEST INTERCEPT ===');
  console.log('[AuthInterceptor] URL:', request.url);
  console.log('[AuthInterceptor] Method:', request.method);
  console.log('[AuthInterceptor] Token disponível:', !!token);
  if (token) {
    console.log('[AuthInterceptor] Token completo:', token);
    console.log('[AuthInterceptor] Token length:', token.length);
  }

  // Adiciona token e headers padrão
  if (token && !request.url.includes('/assets/')) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('[AuthInterceptor] ✓ Header Authorization adicionado');
    console.log('[AuthInterceptor] Headers após clone:', request.headers.keys());
  } else {
    // Adiciona headers mesmo sem token
    request = request.clone({
      setHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!token) {
      console.log('[AuthInterceptor] ✗ AVISO: Nenhum token encontrado!');
      console.log('[AuthInterceptor] localStorage keys:', Object.keys(localStorage));
    }
  }

  // Mostra loading
  loadingService.show();

  return next(request).pipe(
    tap(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Sucesso
        }
      },
      (error: any) => {
        // Trata erros
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            // Token expirado ou inválido
            authService.logout();
          }
        }
      }
    ),
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);
      return throwError(() => error);
    }),
    finalize(() => {
      // Para loading
      loadingService.hide();
    })
  );
};
