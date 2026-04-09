import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { PrimaryButtonComponent, SecondaryButtonComponent, CardComponent } from '@app/components/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '@app/models/auth.model';

@Component({
    selector: 'app-patient-dashboard',
    imports: [CommonModule, PrimaryButtonComponent, SecondaryButtonComponent, CardComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="patient-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Meu Dashboard</h1>
          <p class="subtitle">Acompanhe sua saúde mental</p>
        </div>
        <div class="header-actions">
          <div class="user-greeting" *ngIf="currentUser$ | async as user">
            <p>Bem-vindo, <strong>{{ user?.name }}</strong></p>
          </div>
          <app-secondary-button
            label="Sair"
            (onClick)="logout()"
          ></app-secondary-button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-content">
        <!-- Welcome Card -->
        <section class="welcome-section">
          <app-card [elevated]="true">
            <div class="welcome-content">
              <h2>Bem-vindo ao Brain Health</h2>
              <p>Sua plataforma de saúde mental e bem-estar</p>
            </div>
          </app-card>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions">
          <h3>Ações Rápidas</h3>
          <div class="actions-grid">
            <app-card [elevated]="true" class="action-card">
              <h4>🩺 Encontrar Profissional</h4>
              <p>Busque profissionais qualificados para atendimento</p>
              <app-primary-button
                label="Buscar"
                (onClick)="navigateToProfessionals()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="action-card">
              <h4>📅 Minhas Consultas</h4>
              <p>Visualize e gerencie suas consultas agendadas</p>
              <app-primary-button
                label="Minhas Consultas"
                (onClick)="navigateToSchedule()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="action-card">
              <h4>📋 Questionário</h4>
              <p>Responda nosso questionário de triagem</p>
              <app-primary-button
                label="Responder"
                (onClick)="navigateToQuestionnaire()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="action-card">
              <h4>⚙️ Meu Perfil</h4>
              <p>Atualize suas informações pessoais</p>
              <app-primary-button
                label="Editar Perfil"
                (onClick)="navigateToProfile()"
              ></app-primary-button>
            </app-card>
          </div>
        </section>

        <!-- Health Status -->
        <section class="health-status">
          <app-card [elevated]="true">
            <h3>Status de Saúde</h3>
            <div class="status-items">
              <div class="status-item">
                <span class="status-label">Última Consulta:</span>
                <span class="status-value">Sem consultas agendadas</span>
              </div>
              <div class="status-item">
                <span class="status-label">Avaliação Geral:</span>
                <span class="status-value">Pendente</span>
              </div>
              <div class="status-item">
                <span class="status-label">Recomendações:</span>
                <span class="status-value">Responda o questionário para receber recomendações personalizadas</span>
              </div>
            </div>
          </app-card>
        </section>

        <!-- Resources -->
        <section class="resources">
          <app-card [elevated]="true">
            <h3>Recursos Úteis</h3>
            <ul class="resources-list">
              <li>
                <strong>📚 Dicas de Bem-estar:</strong>
                <p>Confira nossos artigos e dicas para melhorar sua qualidade de vida</p>
              </li>
              <li>
                <strong>💬 Comunidade:</strong>
                <p>Conecte-se com outros usuários em nossa comunidade segura</p>
              </li>
              <li>
                <strong>🆘 Suporte:</strong>
                <p>Precisa de ajuda? Entre em contato com nosso time de suporte</p>
              </li>
            </ul>
          </app-card>
        </section>
      </main>
    </div>
  `,
    styles: [`
    .patient-dashboard {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 0 20px;

      .header-content {
        h1 {
          font-size: 32px;
          margin: 0 0 8px 0;
          color: #2c3e50;
        }

        .subtitle {
          font-size: 16px;
          color: #7f8c8d;
          margin: 0;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 20px;

        .user-greeting {
          text-align: right;

          p {
            margin: 0;
            font-size: 14px;
            color: #34495e;

            strong {
              color: #2c3e50;
            }
          }
        }
      }
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 40px;

      app-card {
        .welcome-content {
          text-align: center;
          padding: 20px;

          h2 {
            font-size: 24px;
            margin: 0 0 10px 0;
            color: #2c3e50;
          }

          p {
            margin: 0;
            color: #7f8c8d;
            font-size: 16px;
          }
        }
      }
    }

    .quick-actions {
      margin-bottom: 40px;

      h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #2c3e50;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;

        .action-card {
          padding: 20px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }

          h4 {
            font-size: 16px;
            margin: 0 0 10px 0;
            color: #2c3e50;
          }

          p {
            font-size: 14px;
            color: #7f8c8d;
            margin: 0 0 15px 0;
          }
        }
      }
    }

    .health-status {
      margin-bottom: 40px;

      h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #2c3e50;
      }

      .status-items {
        display: flex;
        flex-direction: column;
        gap: 15px;

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;

          .status-label {
            font-weight: 600;
            color: #2c3e50;
          }

          .status-value {
            color: #7f8c8d;
            font-size: 14px;
          }
        }
      }
    }

    .resources {
      margin-bottom: 40px;

      h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #2c3e50;
      }

      .resources-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 15px;
          margin-bottom: 10px;
          background: #f8f9fa;
          border-left: 4px solid #3498db;
          border-radius: 4px;

          strong {
            display: block;
            color: #2c3e50;
            margin-bottom: 5px;
          }

          p {
            margin: 0;
            color: #7f8c8d;
            font-size: 14px;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .patient-dashboard {
        padding: 20px 10px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;

        .header-actions {
          width: 100%;
          justify-content: space-between;
        }
      }

      .quick-actions .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PatientDashboardComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  navigateToProfessionals(): void {
    this.router.navigate(['/professionals']);
  }

  navigateToSchedule(): void {
    this.router.navigate(['/schedule']);
  }

  navigateToQuestionnaire(): void {
    this.router.navigate(['/questionnaire']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
