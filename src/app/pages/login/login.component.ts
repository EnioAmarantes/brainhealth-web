import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent } from '@app/components/shared';
import { AuthService } from '@app/services/auth.service';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule, CardComponent, PrimaryButtonComponent, SecondaryButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <div class="login-box">
        <app-card [elevated]="true">
          <h1>Login</h1>
          <p class="subtitle">Acesse sua conta</p>

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
            Não tem conta? <a href="#signup" (click)="navigateToSignup()" class="link">Cadastre-se aqui</a>
          </div>
        </app-card>
      </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      animation: slideUp 0.6s ease-out;

      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        color: #333;
        text-align: center;
      }

      .subtitle {
        margin: 0 0 24px 0;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
    }

    form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }

      input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        &:invalid:not(:placeholder-shown) {
          border-color: #ff6b6b;
        }
      }

      .error {
        display: block;
        color: #ff6b6b;
        font-size: 12px;
        margin-top: 4px;
      }
    }

    .error-message {
      background: #ffe0e0;
      border: 1px solid #ff6b6b;
      color: #c92a2a;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .form-footer {
      text-align: center;
      margin: 16px 0;

      .link {
        color: #667eea;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .signup-link {
      text-align: center;
      margin: 20px 0;
      font-size: 14px;
      color: #666;

      .link {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading$ = new BehaviorSubject<boolean>(false); // Use BehaviorSubject for loading state
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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
      this.isLoading$.next(true); // Set loading to true
      this.authService.login(credentials)
        .pipe(
          finalize(() => {
            this.isLoading$.next(false); // Set loading to false
          })
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

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup/patient']);
  }
}
