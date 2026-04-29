import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LoginResponse } from '@app/models/auth.model';
import { environment } from '@environments/environment';

declare var google: any;
declare global {
  interface Window {
    AppleID: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private googleClientId = environment.googleClientId || '';

  constructor(private http: HttpClient) {
    this.initializeGoogleSDK();
    this.initializeAppleSDK();
  }

  /**
   * Inicializa Google SDK
   */
  private initializeGoogleSDK(): void {
    if (!this.googleClientId) {
      console.warn('Google Client ID não configurado');
      return;
    }

    // Carrega o script do Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  /**
   * Inicializa Apple SDK
   */
  private initializeAppleSDK(): void {
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  /**
   * Efetua login via Google
   */
  loginWithGoogle(): Observable<LoginResponse> {
    return new Observable(observer => {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => {
          if (response.credential) {
            this.decodeGoogleToken(response.credential).subscribe({
              next: (googleData: any) => {
                this.authenticateWithGoogle(googleData).subscribe({
                  next: (authResponse: LoginResponse) => {
                    observer.next(authResponse);
                    observer.complete();
                  },
                  error: (error) => observer.error(error)
                });
              },
              error: (error) => observer.error(error)
            });
          } else {
            observer.error(new Error('Falha na autenticação do Google'));
          }
        },
        error_callback: () => {
          observer.error(new Error('Erro ao inicializar Google Sign-In'));
        }
      });

      // Renderiza o botão do Google
      const googleButtonDiv = document.getElementById('google-signin-btn');
      if (googleButtonDiv) {
        google.accounts.id.renderButton(googleButtonDiv, {
          theme: 'outline',
          size: 'large',
          width: '100%'
        });
      }
    });
  }

  /**
   * Efetua login via Apple
   */
  loginWithApple(): Observable<LoginResponse> {
    return new Observable(observer => {
      if (!window.AppleID) {
        observer.error(new Error('Apple Sign-In SDK não carregado'));
        return;
      }

      window.AppleID.auth.init({
        clientId: environment.appleClientId,
        teamId: environment.appleTeamId,
        keyId: environment.appleKeyId,
        redirectURI: `${environment.appUrl}/auth/apple-callback`,
        scope: 'email name',
        responseType: 'code id_token',
        responseMode: 'form_post',
        usePopup: true
      });

      window.AppleID.auth.signIn().then((response: any) => {
        if (response.authorization) {
          const appleRequest: any = {
            appleId: response.user?.userId || response.user?.email?.split('@')[0],
            email: response.user?.email,
            name: response.user?.name?.firstName
              ? `${response.user.name.firstName} ${response.user.name.lastName || ''}`.trim()
              : undefined,
            identityToken: response.authorization?.id_token
          };

          this.authenticateWithApple(appleRequest).subscribe({
            next: (authResponse: LoginResponse) => {
              observer.next(authResponse);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        } else {
          observer.error(new Error('Falha na autenticação do Apple'));
        }
      }).catch((error: any) => {
        observer.error(new Error(`Erro na autenticação do Apple: ${error.message}`));
      });
    });
  }

  /**
   * Decodifica JWT do Google (basic parsing sem validação de assinatura)
   */
  private decodeGoogleToken(token: string): Observable<any> {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return of(decoded);
    } catch (error) {
      return new Observable(observer => observer.error('Token inválido'));
    }
  }

  /**
   * Autentica com backend usando dados do Google
   */
  private authenticateWithGoogle(googleData: any): Observable<LoginResponse> {
    const request = {
      googleId: googleData.sub,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture
    };

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/google-callback`,
      request
    ).pipe(
      tap(response => {
        console.log('Autenticação Google bem-sucedida');
      }),
      catchError(error => {
        console.error('Erro na autenticação Google:', error);
        throw error;
      })
    );
  }

  /**
   * Autentica com backend usando dados do Apple
   */
  private authenticateWithApple(appleRequest: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/apple-callback`,
      appleRequest
    ).pipe(
      tap(response => {
        console.log('Autenticação Apple bem-sucedida');
      }),
      catchError(error => {
        console.error('Erro na autenticação Apple:', error);
        throw error;
      })
    );
  }

  /**
   * Obtém o script de botão do Google para renderizar
   */
  renderGoogleButton(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element && google) {
      google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: '100%'
      });
    }
  }

  /**
   * Renderiza botão do Apple
   */
  renderAppleButton(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element && window.AppleID) {
      window.AppleID.auth.init({
        clientId: environment.appleClientId,
        teamId: environment.appleTeamId,
        keyId: environment.appleKeyId,
        redirectURI: `${environment.appUrl}/auth/apple-callback`,
        scope: 'email name',
        responseType: 'code id_token',
        responseMode: 'form_post',
        usePopup: true
      });
    }
  }
}
