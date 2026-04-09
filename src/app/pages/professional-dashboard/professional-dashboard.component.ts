import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ProfessionalService } from '@app/services/professional.service';
import { PrimaryButtonComponent, SecondaryButtonComponent, CardComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { Professional } from '@app/models/professional.model';
import { finalize } from 'rxjs/operators';
import { UserType } from '@app/models/auth.model';

@Component({
    selector: 'app-professional-dashboard',
    imports: [CommonModule, PrimaryButtonComponent, SecondaryButtonComponent, CardComponent, LoadingIndicatorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="professional-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard Profissional</h1>
          <p class="subtitle">Gerencie seus pacientes e consultas</p>
        </div>
        <div class="header-actions">
          <div class="user-greeting" *ngIf="currentProfessional$ | async as professional">
            <p>Bem-vindo, <strong>{{ professional?.name || 'Profissional' }}</strong></p>
          </div>
          <app-secondary-button
            label="Sair"
            (onClick)="logout()"
          ></app-secondary-button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-content">
        <!-- Profile Section -->
        <div *ngIf="isLoading$ | async" class="loading-section">
          <app-loading-indicator></app-loading-indicator>
          <p>Carregando dados...</p>
        </div>

        <ng-container *ngIf="!(isLoading$ | async) && (currentProfessional$ | async) as professional">
          <!-- Professional Profile Card -->
          <section class="profile-section">
            <app-card [elevated]="true">
              <div class="profile-header">
                <div class="profile-info">
                  <h2>{{ professional.name }}</h2>
                  <p class="registration">{{ professional.crp }}</p>
                  <p class="specialties">{{ professional.specialties }}</p>
                </div>
                <div class="profile-stats">
                  <div class="stat-box">
                    <div class="stat-value">{{ professional.totalPatients }}</div>
                    <div class="stat-label">Pacientes</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">⭐ {{ professional.averageRating }}</div>
                    <div class="stat-label">Avaliação</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">R$ {{ professional.consultationPrice | number: '1.2-2' }}</div>
                    <div class="stat-label">Taxa de Consulta</div>
                  </div>
                </div>
              </div>

              <div class="profile-details">
                <div class="detail-group">
                  <label>Localização</label>
                  <p>{{ professional.address.street }}, {{ professional.address.city }} - {{ professional.address.state }}</p>
                </div>
                <div class="detail-group">
                  <label>Descrição</label>
                  <p>{{ professional.description || 'Nenhuma descrição adicionada' }}</p>
                </div>
              </div>

              <div class="profile-actions">
                <app-primary-button
                  label="Editar Perfil"
                  (onClick)="editProfile(professional.id)"
                ></app-primary-button>
              </div>
            </app-card>
          </section>

          <!-- Profile Details Section (if exists) -->
          <section *ngIf="professionalProfile$ | async as profile" class="profile-details-section">
            <app-card [elevated]="true">
              <h3>Informações Profissionais Detalhadas</h3>
              
              <div class="details-grid">
                <div class="detail-item">
                  <label>Formação Acadêmica</label>
                  <p>{{ profile.education || 'Não informado' }}</p>
                </div>

                <div class="detail-item">
                  <label>Anos de Experiência</label>
                  <p>{{ profile.yearsOfExperience }} anos</p>
                </div>

                <div class="detail-item">
                  <label>Abordagens Terapêuticas</label>
                  <p>{{ profile.therapeuticApproaches || 'Não informado' }}</p>
                </div>

                <div class="detail-item">
                  <label>Populações Atendidas</label>
                  <p>{{ profile.populationsServed || 'Não informado' }}</p>
                </div>

                <div class="detail-item">
                  <label>Idiomas</label>
                  <p>{{ profile.languages || 'Não informado' }}</p>
                </div>

                <div class="detail-item">
                  <label>Modalidades de Atendimento</label>
                  <p>
                    <span *ngIf="profile.officeConsultation" class="badge">Presencial</span>
                    <span *ngIf="profile.onlineConsultation" class="badge">Online</span>
                  </p>
                </div>
              </div>

              <div class="profile-actions">
                <app-primary-button
                  label="Atualizar Dados Profissionais"
                  (onClick)="editProfessionalDetails(professional.id)"
                ></app-primary-button>
              </div>
            </app-card>
          </section>

          <!-- Quick Stats Section -->
          <section class="stats-section">
            <app-card [elevated]="true">
              <h3>Resumo da Atividade</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">📋</div>
                  <div class="stat-info">
                    <div class="stat-number">{{ professional.totalPatients }}</div>
                    <div class="stat-description">Pacientes Ativos</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">✅</div>
                  <div class="stat-info">
                    <div class="stat-number">{{ getAvailableSlots() }}</div>
                    <div class="stat-description">Horários Disponíveis</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">💰</div>
                  <div class="stat-info">
                    <div class="stat-number">R$ {{ ((professional?.consultationPrice || 0) * (professional?.totalPatients || 0)) | number: '1.2-2' }}</div>
                    <div class="stat-description">Faturamento Potencial*</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">⭐</div>
                  <div class="stat-info">
                    <div class="stat-number">{{ professional.averageRating || 0 }}/5.0</div>
                    <div class="stat-description">Avaliação Média</div>
                  </div>
                </div>
              </div>
              <p class="note">* Estimativa baseada no número de pacientes e taxa de consulta</p>
            </app-card>
          </section>

          <!-- Actions Section -->
          <section class="actions-section">
            <app-card [elevated]="true">
              <h3>Ações Rápidas</h3>
              <div class="actions-grid">
                <app-primary-button
                  label="Visualizar Pacientes"
                  (onClick)="viewPatients()"
                ></app-primary-button>

                <app-primary-button
                  label="Agendar Consulta"
                  (onClick)="scheduleConsultation()"
                ></app-primary-button>

                <app-primary-button
                  label="Ver Agenda"
                  (onClick)="viewSchedule()"
                ></app-primary-button>

                <app-primary-button
                  label="Configurações"
                  (onClick)="openSettings()"
                ></app-primary-button>
              </div>
            </app-card>
          </section>
        </ng-container>

        <!-- Availability Status -->
        <div class="availability-status" *ngIf="(currentProfessional$ | async) as professional">
          <app-card [elevated]="false">
            <div class="status-content">
              <div class="status-indicator" [class.available]="professional.availableForNewPatients">
                <span>{{ professional.availableForNewPatients ? '🟢' : '🔴' }}</span>
              </div>
              <div>
                <p class="status-text">
                  Atualmente {{ professional.availableForNewPatients ? 'disponível para novos pacientes' : 'não aceitando novos pacientes' }}
                </p>
              </div>
              <app-secondary-button
                [label]="professional.availableForNewPatients ? 'Desabilitar' : 'Habilitar'"
                (onClick)="toggleAvailability(professional)"
              ></app-secondary-button>
            </div>
          </app-card>
        </div>
      </main>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .professional-dashboard {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .header-content {
        flex: 1;

        h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
        }

        .subtitle {
          margin: 0;
          font-size: 16px;
          opacity: 0.95;
        }
      }

      .header-actions {
        text-align: right;

        .user-greeting {
          margin-bottom: 20px;
          font-size: 14px;

          p {
            margin: 0;
            opacity: 0.9;
          }

          strong {
            opacity: 1;
          }
        }
      }
    }

    .dashboard-content {
      flex: 1;
      padding: 40px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 20px;

      p {
        font-size: 16px;
        color: #666;
      }
    }

    // Profile Section
    .profile-section {
      margin-bottom: 32px;

      .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 40px;
        margin-bottom: 32px;
        padding-bottom: 32px;
        border-bottom: 1px solid #e0e0e0;

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 20px;
        }

        .profile-info {
          flex: 1;

          h2 {
            margin: 0 0 8px 0;
            font-size: 24px;
            color: #333;
          }

          .registration {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #999;
            font-family: monospace;
          }

          .specialties {
            margin: 0;
            font-size: 16px;
            color: #667eea;
            font-weight: 600;
          }
        }

        .profile-stats {
          display: flex;
          gap: 20px;

          @media (max-width: 768px) {
            flex-wrap: wrap;
          }

          .stat-box {
            background: #f9f9f9;
            padding: 16px 24px;
            border-radius: 12px;
            text-align: center;
            min-width: 120px;

            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #667eea;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 12px;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }
        }
      }

      .profile-details {
        margin-bottom: 24px;

        .detail-group {
          margin-bottom: 16px;

          label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            font-size: 14px;
          }

          p {
            margin: 0;
            color: #666;
            line-height: 1.6;
          }
        }
      }

      .profile-actions {
        display: flex;
        gap: 12px;
      }
    }

    // Profile Details Section
    .profile-details-section {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 24px 0;
        font-size: 20px;
        color: #333;
        font-weight: 600;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        margin-bottom: 24px;

        .detail-item {
          label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            font-size: 14px;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
          }

          .badge {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 8px;
          }
        }
      }

      .profile-actions {
        display: flex;
        gap: 12px;
      }
    }

    // Stats Section
    .stats-section {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 24px 0;
        font-size: 20px;
        color: #333;
        font-weight: 600;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 16px;

        .stat-card {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e0e0e0;

          .stat-icon {
            font-size: 32px;
            flex-shrink: 0;
          }

          .stat-info {
            .stat-number {
              font-size: 20px;
              font-weight: 700;
              color: #333;
              margin-bottom: 4px;
            }

            .stat-description {
              font-size: 13px;
              color: #666;
            }
          }
        }
      }

      .note {
        margin: 0;
        font-size: 12px;
        color: #999;
        font-style: italic;
      }
    }

    // Actions Section
    .actions-section {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 24px 0;
        font-size: 20px;
        color: #333;
        font-weight: 600;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
    }

    // Availability Status
    .availability-status {
      margin-bottom: 32px;

      .status-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .status-indicator {
          font-size: 24px;

          &.available {
            color: #28a745;
          }

          &:not(.available) {
            color: #dc3545;
          }
        }

        .status-text {
          margin: 0;
          flex: 1;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 20px;

        .header-actions {
          text-align: left;
          width: 100%;
        }
      }

      .dashboard-content {
        padding: 20px;
      }
    }
  `]
})
export class ProfessionalDashboardComponent implements OnInit {
  currentProfessional$ = new BehaviorSubject<Professional | null>(null);
  professionalProfile$ = new BehaviorSubject<any | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private router: Router,
    private authService: AuthService,
    private professionalService: ProfessionalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfessionalData();
  }

  private loadProfessionalData(): void {
    this.isLoading$.next(true);
    // Get current user and load their professional data
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.role.toUpperCase() === UserType.PROFESSIONAL) {
      this.professionalService.getCurrentProfessional()
        .pipe(
          finalize(() => {
            this.isLoading$.next(false);
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (professional) => {
            this.currentProfessional$.next(professional);
            this.professionalService.getProfessionalProfile(professional.id)
              .subscribe({
                next: (profile) => {
                  this.professionalProfile$.next(profile);
                },
                error: (error) => {
                  console.error('Erro ao carregar perfil:', error);
                }
              });
          },
          error: (error) => {
            console.error('Erro ao carregar profissional:', error);
            this.router.navigate(['/login/professional']);
          }
        });
    } else {
      this.router.navigate(['/login/professional']);
    }
  }

  getAvailableSlots(): number {
    // Mock: returns a random number between 5 and 15
    return Math.floor(Math.random() * 11) + 5;
  }

  editProfile(professionalId: string): void {
    this.router.navigate(['/professional/edit', professionalId]);
  }

  editProfessionalDetails(professionalId: string): void {
    this.router.navigate(['/professional/edit-details', professionalId]);
  }

  viewPatients(): void {
    this.router.navigate(['/professional/patients']);
  }

  scheduleConsultation(): void {
    this.router.navigate(['/professional/schedule']);
  }

  viewSchedule(): void {
    this.router.navigate(['/professional/calendar']);
  }

  openSettings(): void {
    this.router.navigate(['/professional/settings']);
  }

  toggleAvailability(professional: Professional): void {
    const newStatus = !professional.availableForNewPatients;
    this.professionalService.updateAvailability(professional.id, newStatus)
      .subscribe({
        next: (updated) => {
          this.currentProfessional$.next(updated);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erro ao atualizar disponibilidade:', error);
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
