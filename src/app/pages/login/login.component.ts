import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent, PrimaryButtonComponent } from '@app/components/shared';
import { AuthService } from '@app/services/auth.service';
import { OAuthService } from '@app/services/oauth.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule, CardComponent, PrimaryButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <div class="login-box">
        <app-card [elevated]="true">
          <h1>Login</h1>
          <p class="subtitle">Acesse sua conta</p>

          <!-- SSO Section - Patients Only -->
          <div class="sso-header">
            <span class="patient-badge">Apenas Pacientes</span>
          </div>

          <div class="sso-section">
            <div class="sso-buttons">
              <button
                type="button"
                class="sso-button google-button"
                (click)="loginWithGoogle()"
                [disabled]="(isLoading$ | async) ?? false"
                title="Entrar com Google"
                aria-label="Entrar com Google"
              >
                <svg class="sso-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                class="sso-button apple-button"
                (click)="loginWithApple()"
                [disabled]="(isLoading$ | async) ?? false"
                title="Entrar com Apple"
                aria-label="Entrar com Apple"
              >
                <svg class="sso-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M17.05 13.5c-.91 2.92-.73 5.17 1.64 6.87.97.65 1.73 1.1 2.39 1.34.07-1.16 0-2.39-.35-3.82-.88-3.49-2.56-6.09-3.68-4.39zM6.14 5.4c-.37 1.15-.5 2.2-.46 3.38.06 1.85.58 3.66 1.72 5.01 1.14 1.34 2.68 2.07 4.45 2.07 1.24 0 2.47-.38 3.44-1.11.97-.73 1.66-1.81 2.02-2.98.36-1.17.34-2.39-.05-3.55-.39-1.16-1.14-2.15-2.06-2.82-1.84-1.37-5.05-1.07-6.61-.1-1.57.97-2.32 2.32-2.45 3.9zM12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 20c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" fill="#000"/>
                </svg>
                Apple
              </button>
            </div>

            <div class="sso-divider">
              <span>ou</span>
            </div>

            <p class="sso-note">Login tradicional</p>

            <div class="professional-note">
              <p>👨‍⚕️ Profissional? Use a opção de login abaixo.</p>
            </div>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="seu.email@email.com"
                [attr.aria-label]="'Email'"
              />
              <span class="error" *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">
                Email é obrigatório
              </span>
              <span class="error" *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">
                Email inválido
              </span>
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Sua senha segura"
                (keypress)="($event.key === 'Enter') ? onSubmit() : null"
                [attr.aria-label]="'Senha'"
              />
              <span class="error" *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
                Senha é obrigatória
              </span>
            </div>

            <div class="error-message" *ngIf="loginError">
              {{ loginError }}
            </div>

            <app-primary-button
              label="Entrar"
              [disabled]="loginForm.invalid"
              [isLoading]="(isLoading$ | async) ?? false"
              (onClick)="onSubmit()"
            ></app-primary-button>
          </form>

          <div class="form-footer">
            <a href="#forgot-password" class="link">Esqueceu sua senha?</a>
          </div>

          <div class="signup-link">
            Não tem conta? <a href="#signup" class="link">Cadastre-se aqui</a>
          </div>
        </app-card>
      </div>
  `,
    styles: [`
    .login-box {
      width: 100%;
      animation: slideUp 0.6s ease-out;
    }

    .login-box h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
      text-align: center;
    }

    .login-box .subtitle {
      margin: 0 0 20px 0;
      text-align: center;
      color: #666;
      font-size: 13px;
    }

    .sso-section {
      margin-bottom: 20px;
    }

    .sso-header {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }

    .patient-badge {
      display: inline-block;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sso-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    .sso-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .sso-button:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #d0d0d0;
    }

    .sso-button:active:not(:disabled) {
      transform: scale(0.98);
    }

    .sso-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .sso-icon {
      width: 16px;
      height: 16px;
    }

    .google-button:hover:not(:disabled) {
      box-shadow: 0 2px 6px rgba(66, 133, 244, 0.2);
    }

    .apple-button:hover:not(:disabled) {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .sso-divider {
      display: flex;
      align-items: center;
      margin: 12px 0;
      color: #999;
      font-size: 12px;
      position: relative;
    }

    .sso-divider::before {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }

    .sso-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }

    .sso-divider span {
      padding: 0 8px;
    }

    .sso-note {
      text-align: center;
      font-size: 11px;
      color: #999;
      margin: 8px 0 14px 0;
      font-weight: 500;
    }

    form {
      margin-bottom: 16px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #333;
      font-size: 13px;
    }

    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.08);
    }

    .form-group input:invalid:not(:placeholder-shown) {
      border-color: #ff6b6b;
    }

    .form-group .error {
      display: block;
      color: #ff6b6b;
      font-size: 11px;
      margin-top: 2px;
    }

    .error-message {
      background: #ffe0e0;
      border: 1px solid #ff6b6b;
      color: #c92a2a;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 12px;
    }

    .form-footer {
      text-align: center;
      margin: 12px 0;
    }

    .form-footer .link {
      color: #667eea;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }

    .form-footer .link:hover {
      text-decoration: underline;
    }

    .signup-link {
      text-align: center;
      margin: 14px 0;
      font-size: 12px;
      color: #666;
    }

    .signup-link .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }

    .signup-link .link:hover {
      text-decoration: underline;
    }

    .professional-note {
      background: rgba(102, 126, 234, 0.08);
      border: 1px solid rgba(102, 126, 234, 0.2);
      border-radius: 6px;
      padding: 8px 10px;
      margin-top: 12px;
      text-align: center;
    }

    .professional-note p {
      margin: 0;
      font-size: 11px;
      color: #667eea;
      font-weight: 500;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading$ = new BehaviorSubject<boolean>(false);
  loginError: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.isLoading$.next(true);
      this.authService.login(credentials)
        .pipe(
          finalize(() => {
            this.isLoading$.next(false);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.loginError = error.error?.message || 'Erro ao fazer login. Tente novamente.';
          }
        });
    }
  }

  loginWithGoogle(): void {
    this.isLoading$.next(true);
    this.oauthService.loginWithGoogle()
      .pipe(
        finalize(() => {
          this.isLoading$.next(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.authService.handleOAuthSuccess(response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loginError = 'Erro ao fazer login com Google. Tente novamente.';
          console.error('Google login error:', error);
        }
      });
  }

  loginWithApple(): void {
    this.isLoading$.next(true);
    this.oauthService.loginWithApple()
      .pipe(
        finalize(() => {
          this.isLoading$.next(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.authService.handleOAuthSuccess(response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loginError = 'Erro ao fazer login com Apple. Tente novamente.';
          console.error('Apple login error:', error);
        }
      });
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup/patient']);
  }
}
