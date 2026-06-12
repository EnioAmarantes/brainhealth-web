import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent, PrimaryButtonComponent } from '@app/components/shared';
import { QuestionnaireScreenComponent } from '../questionnaire/questionnaire-screen.component';
import { LoginComponent } from '../login/login.component';

@Component({
    selector: 'app-login-selector',
    imports: [
        CommonModule,
        LoginComponent,
        QuestionnaireScreenComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="container">
      <!-- Questionnaire Section (60%) -->
      <div class="questionnaire-section">
        <app-questionnaire></app-questionnaire>
      </div>

      <!-- Login Options Section (40%) -->
      <div class="login-section">
        <div class="login-content">
          <p class="eyebrow">Acesso rapido</p>
          <h1 class="app-title">Brain Health</h1>
          <p class="login-description">Entre como paciente ou profissional para continuar sua jornada com seguranca.</p>
          <app-login></app-login>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
      border: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: visible;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
      box-sizing: border-box;
      flex: 1;
    }

    .questionnaire-section {
      flex: 0 0 100%;
      width: 100%;
      height: auto;
      min-height: 60vh;
      overflow-y: auto;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-sizing: border-box;
    }

    .login-section {
      flex: 0 0 auto;
      width: 100%;
      height: auto;
      color: white;
      text-align: left;
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px 18px;
      overflow-y: auto;
      box-sizing: border-box;
      border-top: 3px solid rgba(255, 255, 255, 0.3);
    }

    .login-content {
      width: 100%;
      max-width: 420px;
    }

    .eyebrow {
      margin: 0;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
      opacity: 0.85;
    }

    .app-title {
      margin: 4px 0 8px;
      font-size: 32px;
      line-height: 1.1;
    }

    .login-description {
      margin: 0 0 18px;
      font-size: 14px;
      line-height: 1.5;
      opacity: 0.9;
      max-width: 38ch;
    }

    /* Layout Horizontal - Desktop e Tablets grandes */
    @media (min-width: 1024px) {
      .container {
        flex-direction: row;
        min-width: 100vw;
      }

      .questionnaire-section {
        flex: 0 0 70%;
        width: 70%;
        height: 100%;
        min-height: 100%;
        border-top: none;
      }

      .login-section {
        flex: 0 0 30%;
        width: 30%;
        height: 100%;
        min-height: 100%;
        padding: 40px 26px;
        border-top: none;
      }

      .login-content {
        max-width: 360px;
      }

      .app-title {
        font-size: 34px;
      }
    }

    /* Layout Vertical - Tablets e Mobile */
    @media (max-width: 1023px) {
      .container {
        overflow-y: auto;
      }

      .questionnaire-section {
        min-height: auto;
      }

      .login-content {
        max-width: 100%;

        .app-title {
          font-size: 28px;
          margin-bottom: 10px;
        }
      }

      .login-description {
        margin-bottom: 16px;
      }
    }

    /* Mobile pequeno */
    @media (max-width: 480px) {
      .login-section {
        padding: 18px 14px;
      }

      .eyebrow {
        font-size: 11px;
      }

      .login-content .app-title {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .login-description {
        font-size: 13px;
        margin-bottom: 14px;
      }
    }
  `]
})
export class LoginSelectorComponent {
  constructor(private router: Router) {}

  navigateToProfessionalLogin(): void {
    this.router.navigate(['/login/professional']);
  }

  navigateToPatientLogin(): void {
    this.router.navigate(['/login/patient']);
  }

  navigateToQuestionnaire(): void {
    this.router.navigate(['/questionnaire']);
  }
}
