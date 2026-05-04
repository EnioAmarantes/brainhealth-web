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
          <h1 class="app-title">Brain Health</h1>
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
      text-align: center;
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      overflow-y: auto;
      box-sizing: border-box;
      border-top: 3px solid rgba(255, 255, 255, 0.3);
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
        padding: 40px 30px;
        border-top: none;
      }

      .login-content {
        max-width: 350px;
      }
    }

    /* Layout Vertical - Tablets e Mobile */
    @media (max-width: 1023px) {
      .login-content {
        max-width: 100%;

        .app-title {
          font-size: 22px;
          margin-bottom: 20px;
        }

        .login-options {
          gap: 12px;

          app-card {
            .option-content {
              h3 {
                font-size: 14px;
              }

              p {
                font-size: 12px;
                margin-bottom: 12px;
              }
            }
          }
        }
      }
    }

    /* Mobile pequeno */
    @media (max-width: 480px) {
      .login-section {
        padding: 16px;
      }

      .login-content {
        max-width: 100%;

        .app-title {
          font-size: 18px;
          margin-bottom: 16px;
        }

        .login-options {
          gap: 10px;

          app-card {
            .option-content {
              h3 {
                font-size: 12px;
              }

              p {
                font-size: 11px;
                margin-bottom: 10px;
              }
            }
          }
        }
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
