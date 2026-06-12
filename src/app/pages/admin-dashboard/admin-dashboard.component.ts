import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { PrimaryButtonComponent, SecondaryButtonComponent, CardComponent } from '@app/components/shared';
import { Observable } from 'rxjs';
import { User } from '@app/models/auth.model';
import { MvpMetricsService, MvpValidationMetrics } from '@app/services/mvp-metrics.service';
import {
  ProfessionalService,
  AdminProfessionalModerationItem,
  UpdateProfessionalModerationPayload
} from '@app/services/professional.service';

@Component({
    selector: 'app-admin-dashboard',
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
          <h3>Métricas de Validação MVP</h3>
          <div class="metrics-toolbar">
            <div class="window-selector">
              <button
                *ngFor="let days of windowOptions"
                type="button"
                class="window-button"
                [class.active]="selectedWindowDays === days"
                (click)="onWindowDaysChange(days)"
              >
                {{ days }} dias
              </button>
            </div>
            <app-secondary-button
              label="Atualizar"
              (onClick)="refreshMetrics()"
            ></app-secondary-button>
          </div>

          <p class="metrics-feedback" *ngIf="isLoadingMetrics">Carregando métricas...</p>
          <p class="metrics-feedback error" *ngIf="metricsError">{{ metricsError }}</p>

          <div class="status-grid">
            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">👥</div>
                <div class="status-info">
                  <h4>Profissionais Cadastrados</h4>
                  <div class="status-number">{{ metrics?.offer?.professionalsRegistered ?? 0 }}</div>
                  <p class="status-change">Base total cadastrada</p>
                </div>
              </div>
            </app-card>

            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">👨‍⚕️</div>
                <div class="status-info">
                  <h4>Profissionais Ativos</h4>
                  <div class="status-number">{{ metrics?.offer?.professionalsActive ?? 0 }}</div>
                  <p class="status-change">Disponíveis para novos pacientes</p>
                </div>
              </div>
            </app-card>

            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">🏥</div>
                <div class="status-info">
                  <h4>Triagens Concluídas</h4>
                  <div class="status-number">{{ metrics?.demand?.triagesCompleted ?? 0 }}</div>
                  <p class="status-change">{{ metrics?.demand?.triagesCompletedLastNDays ?? 0 }} na janela selecionada</p>
                </div>
              </div>
            </app-card>

            <app-card [elevated]="true" class="status-card">
              <div class="status-card-content">
                <div class="status-icon">📊</div>
                <div class="status-info">
                  <h4>Taxa de Clique</h4>
                  <div class="status-number">{{ formatPercent(metrics?.conversion?.clickRatePercent) }}</div>
                  <p class="status-change">{{ metrics?.conversion?.professionalClicksLastNDays ?? 0 }} cliques | {{ metrics?.conversion?.leadsGeneratedLastNDays ?? 0 }} leads</p>
                </div>
              </div>
            </app-card>
          </div>
        </section>

        <section class="moderation-section">
          <div class="moderation-header">
            <h3>Moderação de Profissionais</h3>
            <app-secondary-button
              label="Atualizar fila"
              (onClick)="loadModerationQueue()"
            ></app-secondary-button>
          </div>

          <p class="moderation-feedback" *ngIf="isLoadingModeration">Carregando fila de moderação...</p>
          <p class="moderation-feedback error" *ngIf="moderationError">{{ moderationError }}</p>

          <div class="moderation-summary" *ngIf="!isLoadingModeration">
            <span>Pendentes: <strong>{{ pendingCount }}</strong></span>
            <span>Visíveis: <strong>{{ visibleCount }}</strong></span>
            <span>Ocultos: <strong>{{ hiddenCount }}</strong></span>
          </div>

          <div class="moderation-grid" *ngIf="moderationQueue.length > 0">
            <app-card [elevated]="true" class="moderation-card" *ngFor="let professional of moderationQueue">
              <div class="moderation-card-header">
                <div>
                  <h4>{{ professional.fullName }}</h4>
                  <p class="meta">{{ professional.registrationNumber }} | {{ professional.city }} - {{ professional.state }}</p>
                </div>
                <div class="badges">
                  <span class="badge pending" *ngIf="!professional.isApproved">Pendente</span>
                  <span class="badge approved" *ngIf="professional.isApproved">Aprovado</span>
                  <span class="badge visible" *ngIf="professional.isVisible">Visível</span>
                  <span class="badge hidden" *ngIf="!professional.isVisible">Oculto</span>
                </div>
              </div>

              <p class="specialties">{{ professional.specialties }}</p>
              <p class="meta">{{ professional.email }}</p>

              <div class="moderation-actions">
                <app-primary-button
                  label="Aprovar"
                  [disabled]="professional.isApproved || isModerating(professional.id)"
                  (onClick)="approveProfessional(professional.id)"
                ></app-primary-button>

                <app-secondary-button
                  [label]="professional.isVisible ? 'Ocultar' : 'Exibir'"
                  [disabled]="isModerating(professional.id)"
                  (onClick)="toggleVisibility(professional)"
                ></app-secondary-button>
              </div>
            </app-card>
          </div>

          <app-card [elevated]="true" *ngIf="!isLoadingModeration && moderationQueue.length === 0">
            <p class="empty-state">Nenhum profissional na fila de moderação no momento.</p>
          </app-card>
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

      .metrics-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
      }

      .window-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .window-button {
        border: 1px solid rgba(255, 255, 255, 0.45);
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-radius: 999px;
        padding: 6px 12px;
        font-weight: 600;
        cursor: pointer;
      }

      .window-button.active {
        background: #ffffff;
        color: #2c3e50;
      }

      .metrics-feedback {
        margin: 0 0 12px 0;
        color: #ffffff;
        font-weight: 500;
      }

      .metrics-feedback.error {
        color: #ffd3d0;
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

    .moderation-section {
      margin-bottom: 40px;

      .moderation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        h3 {
          font-size: 20px;
          color: #ffffff;
          margin: 0;
        }
      }

      .moderation-feedback {
        color: #ffffff;
        margin: 0 0 12px;
      }

      .moderation-feedback.error {
        color: #ffd3d0;
      }

      .moderation-summary {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        color: #ffffff;
        margin-bottom: 14px;
        font-size: 13px;
      }

      .moderation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 16px;
      }

      .moderation-card {
        background: rgba(255, 255, 255, 0.95);

        .moderation-card-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 16px;
        }

        .meta {
          margin: 6px 0;
          color: #5f6d7a;
          font-size: 12px;
        }

        .specialties {
          margin: 8px 0;
          color: #34495e;
          font-size: 13px;
        }

        .badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge {
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .badge.pending {
          background: #fff1cc;
          color: #9a6700;
        }

        .badge.approved {
          background: #dff7e5;
          color: #1b7f3a;
        }

        .badge.visible {
          background: #dbeeff;
          color: #0f5fa8;
        }

        .badge.hidden {
          background: #f8d7da;
          color: #8a1c1c;
        }

        .moderation-actions {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
      }

      .empty-state {
        margin: 0;
        color: #5f6d7a;
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
      .moderation-section .moderation-grid,
      .management-sections .management-grid {
        grid-template-columns: 1fr;
      }

      .moderation-section {
        .moderation-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .moderation-card .moderation-card-header {
          flex-direction: column;
        }

        .moderation-card .badges {
          justify-content: flex-start;
        }

        .moderation-card .moderation-actions {
          grid-template-columns: 1fr;
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  metrics: MvpValidationMetrics | null = null;
  isLoadingMetrics = false;
  metricsError: string | null = null;
  selectedWindowDays = 7;
  readonly windowOptions = [7, 14, 30];
  moderationQueue: AdminProfessionalModerationItem[] = [];
  isLoadingModeration = false;
  moderationError: string | null = null;
  processingModerationIds = new Set<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private mvpMetricsService: MvpMetricsService,
    private professionalService: ProfessionalService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadMetrics(this.selectedWindowDays);
    this.loadModerationQueue();
  }

  onWindowDaysChange(days: number): void {
    if (this.selectedWindowDays === days) {
      return;
    }

    this.selectedWindowDays = days;
    this.loadMetrics(days);
  }

  refreshMetrics(): void {
    this.loadMetrics(this.selectedWindowDays);
  }

  get pendingCount(): number {
    return this.moderationQueue.filter(item => !item.isApproved).length;
  }

  get visibleCount(): number {
    return this.moderationQueue.filter(item => item.isVisible).length;
  }

  get hiddenCount(): number {
    return this.moderationQueue.filter(item => !item.isVisible).length;
  }

  isModerating(professionalId: string): boolean {
    return this.processingModerationIds.has(professionalId);
  }

  loadModerationQueue(): void {
    this.isLoadingModeration = true;
    this.moderationError = null;

    this.professionalService.getModerationQueue().subscribe({
      next: (items) => {
        this.moderationQueue = items;
        this.isLoadingModeration = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.moderationError = 'Nao foi possivel carregar a fila de moderacao.';
        this.isLoadingModeration = false;
        this.cdr.markForCheck();
      }
    });
  }

  approveProfessional(professionalId: string): void {
    this.updateModeration(professionalId, { isApproved: true, isVisible: true });
  }

  toggleVisibility(professional: AdminProfessionalModerationItem): void {
    this.updateModeration(professional.id, { isVisible: !professional.isVisible });
  }

  private updateModeration(professionalId: string, payload: UpdateProfessionalModerationPayload): void {
    this.processingModerationIds.add(professionalId);

    this.professionalService.updateProfessionalModeration(professionalId, payload).subscribe({
      next: (updatedItem) => {
        this.moderationQueue = this.moderationQueue.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        );

        this.processingModerationIds.delete(professionalId);
        this.cdr.markForCheck();
      },
      error: () => {
        this.processingModerationIds.delete(professionalId);
        this.moderationError = 'Nao foi possivel atualizar a moderacao do profissional.';
        this.cdr.markForCheck();
      }
    });
  }

  formatPercent(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '0%';
    }

    return `${Number(value).toFixed(2)}%`;
  }

  private loadMetrics(days: number): void {
    this.isLoadingMetrics = true;
    this.metricsError = null;

    this.mvpMetricsService.getMvpMetrics(days).subscribe({
      next: (data) => {
        this.metrics = data;
        this.isLoadingMetrics = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.metricsError = 'Nao foi possivel carregar as metricas de validacao.';
        this.isLoadingMetrics = false;
        this.cdr.markForCheck();
      }
    });
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToProfessionals(): void {
    this.loadModerationQueue();
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
