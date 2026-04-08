import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { PrimaryButtonComponent, SecondaryButtonComponent, CardComponent } from '@app/components/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '@app/models/auth.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, PrimaryButtonComponent, SecondaryButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Painel Administrativo</h1>
          <p class="subtitle">Gerencie a plataforma Brain Health</p>
        </div>
        <div class="header-actions">
          <div class="user-greeting" *ngIf="currentUser$ | async as user">
            <p>Bem-vindo, <strong>{{ user?.name }}</strong></p>
            <span class="admin-badge">Administrador</span>
          </div>
          <app-secondary-button
            label="Sair"
            (onClick)="logout()"
          ></app-secondary-button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-content">
        <!-- System Status -->
        <section class="system-status">
          <h3>Status do Sistema</h3>
          <div class="status-grid">
            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">👥</div>
                <div class="status-info">
                  <h4>Total de Usuários</h4>
                  <div class="status-number">1,234</div>
                  <p class="status-change">+12% este mês</p>
                </div>
              </div>
            </app-card>

            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">👨‍⚕️</div>
                <div class="status-info">
                  <h4>Profissionais</h4>
                  <div class="status-number">156</div>
                  <p class="status-change">+8% este mês</p>
                </div>
              </div>
            </app-card>

            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">🏥</div>
                <div class="status-info">
                  <h4>Consultas Realizadas</h4>
                  <div class="status-number">4,521</div>
                  <p class="status-change">+23% este mês</p>
                </div>
              </div>
            </app-card>

            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">📊</div>
                <div class="status-info">
                  <h4>Taxa de Atividade</h4>
                  <div class="status-number">87%</div>
                  <p class="status-change">Excelente</p>
                </div>
              </div>
            </app-card>
          </div>
        </section>

        <!-- Management Sections -->
        <section class="management-sections">
          <h3>Gerenciamento</h3>
          <div class="management-grid">
            <app-card [elevated]="true" class="management-card">
              <div class="card-header">
                <h4>👥 Usuários</h4>
              </div>
              <p>Visualize e gerencie todos os usuários da plataforma</p>
              <ul class="management-list">
                <li>Pacientes: 945</li>
                <li>Profissionais: 156</li>
                <li>Administradores: 3</li>
              </ul>
              <app-primary-button
                label="Gerenciar Usuários"
                (onClick)="navigateToUsers()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="management-card">
              <div class="card-header">
                <h4>📋 Profissionais</h4>
              </div>
              <p>Gerencie profissionais, validações e especialidades</p>
              <ul class="management-list">
                <li>Verificação: 12 pendentes</li>
                <li>Ativos: 144</li>
                <li>Inativos: 0</li>
              </ul>
              <app-primary-button
                label="Gerenciar Profissionais"
                (onClick)="navigateToProfessionals()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="management-card">
              <div class="card-header">
                <h4>📊 Relatórios</h4>
              </div>
              <p>Analise dados e gere relatórios do sistema</p>
              <ul class="management-list">
                <li>Relatório de Atividades</li>
                <li>Relatório de Receita</li>
                <li>Relatório de Satisfação</li>
              </ul>
              <app-primary-button
                label="Ver Relatórios"
                (onClick)="navigateToReports()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="management-card">
              <div class="card-header">
                <h4>⚙️ Configurações</h4>
              </div>
              <p>Configure parâmetros e políticas da plataforma</p>
              <ul class="management-list">
                <li>Taxas de Serviço</li>
                <li>Políticas de Privacidade</li>
                <li>Integração com APIs</li>
              </ul>
              <app-primary-button
                label="Configurações"
                (onClick)="navigateToSettings()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="management-card">
              <div class="card-header">
                <h4>🔔 Notificações</h4>
              </div>
              <p>Gerencie campanhas e notificações do sistema</p>
              <ul class="management-list">
                <li>Campanhas Ativas: 3</li>
                <li>Notificações Pendentes: 234</li>
              </ul>
              <app-primary-button
                label="Gerenciar Notificações"
                (onClick)="navigateToNotifications()"
              ></app-primary-button>
            </app-card>

            <app-card [elevated]="true" class="management-card">
              <div class="card-header">
                <h4>🛡️ Segurança</h4>
              </div>
              <p>Monitore segurança e auditoria do sistema</p>
              <ul class="management-list">
                <li>Log de Acessos</li>
                <li>Detecção de Fraude</li>
                <li>Backup do Sistema</li>
              </ul>
              <app-primary-button
                label="Segurança"
                (onClick)="navigateToSecurity()"
              ></app-primary-button>
            </app-card>
          </div>
        </section>

        <!-- Recent Activities -->
        <section class="recent-activities">
          <app-card [elevated]="true">
            <h3>Atividades Recentes</h3>
            <div class="activities-list">
              <div class="activity-item">
                <span class="activity-icon">✅</span>
                <div class="activity-info">
                  <p class="activity-title">Novo profissional registrado</p>
                  <p class="activity-time">há 2 horas</p>
                </div>
              </div>
              <div class="activity-item">
                <span class="activity-icon">🔄</span>
                <div class="activity-info">
                  <p class="activity-title">Backup automático realizado</p>
                  <p class="activity-time">há 12 horas</p>
                </div>
              </div>
              <div class="activity-item">
                <span class="activity-icon">⚠️</span>
                <div class="activity-info">
                  <p class="activity-title">Alerta de segurança: 3 tentativas de acesso falhadas</p>
                  <p class="activity-time">há 24 horas</p>
                </div>
              </div>
              <div class="activity-item">
                <span class="activity-icon">📝</span>
                <div class="activity-info">
                  <p class="activity-title">Relatório mensal gerado</p>
                  <p class="activity-time">há 2 dias</p>
                </div>
              </div>
            </div>
          </app-card>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          color: #ffffff;
        }

        .subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
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
            color: rgba(255, 255, 255, 0.9);

            strong {
              color: #ffffff;
            }
          }

          .admin-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
          }
        }
      }
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .system-status {
      margin-bottom: 40px;

      h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #ffffff;
      }

      .status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;

        .status-card {
          background: rgba(255, 255, 255, 0.95);

          .status-card-content {
            display: flex;
            align-items: center;
            gap: 20px;

            .status-icon {
              font-size: 40px;
            }

            .status-info {
              flex: 1;

              h4 {
                font-size: 14px;
                margin: 0;
                color: #7f8c8d;
                text-transform: uppercase;
                font-weight: 600;
              }

              .status-number {
                font-size: 28px;
                font-weight: bold;
                color: #2c3e50;
                margin: 8px 0;
              }

              .status-change {
                margin: 0;
                font-size: 12px;
                color: #27ae60;
              }
            }
          }
        }
      }
    }

    .management-sections {
      margin-bottom: 40px;

      h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #ffffff;
      }

      .management-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;

        .management-card {
          background: rgba(255, 255, 255, 0.95);
          transition: transform 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          }

          .card-header {
            margin-bottom: 12px;

            h4 {
              font-size: 16px;
              margin: 0;
              color: #2c3e50;
            }
          }

          p {
            margin: 0 0 15px 0;
            color: #7f8c8d;
            font-size: 14px;
          }

          .management-list {
            list-style: none;
            padding: 0;
            margin: 0 0 15px 0;

            li {
              padding: 8px 0;
              color: #34495e;
              font-size: 13px;
              border-bottom: 1px solid #ecf0f1;

              &:last-child {
                border-bottom: none;
              }
            }
          }
        }
      }
    }

    .recent-activities {
      app-card {
        background: rgba(255, 255, 255, 0.95);

        h3 {
          font-size: 18px;
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 15px;

          .activity-item {
            display: flex;
            gap: 15px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            align-items: flex-start;

            .activity-icon {
              font-size: 20px;
              min-width: 24px;
            }

            .activity-info {
              flex: 1;

              .activity-title {
                margin: 0;
                color: #2c3e50;
                font-weight: 500;
                font-size: 14px;
              }

              .activity-time {
                margin: 4px 0 0 0;
                color: #95a5a6;
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .admin-dashboard {
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

      .system-status .status-grid,
      .management-sections .management-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToProfessionals(): void {
    this.router.navigate(['/admin/professionals']);
  }

  navigateToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/admin/settings']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/admin/notifications']);
  }

  navigateToSecurity(): void {
    this.router.navigate(['/admin/security']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
