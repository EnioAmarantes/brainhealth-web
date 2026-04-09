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
    imports: [CommonModule, PrimaryButtonComponent, LoadingIndicatorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./professional-dashboard.component.scss'],
    template: `
    <div class="professional-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="header-title">Dashboard Profissional</h1>
          <p class="header-subtitle">Gerencie seus pacientes, agenda e desempenho profissional</p>
        </div>
        @if (currentProfessional$ | async; as professional) {
          <div class="header-right">
            <div class="user-greeting">
              <span class="greeting-text">Bem-vindo, <strong>{{ professional?.fullName || 'Profissional' }}</strong></span>
            </div>
            <button class="logout-btn" (click)="logout()" title="Sair">
              <span class="logout-icon">↪</span>
            </button>
          </div>
        }
      </header>

      <!-- Main Content -->
      <main class="dashboard-content">
        <!-- Loading State -->
        @if (isLoading$ | async) {
          <div class="loading-section">
            <app-loading-indicator></app-loading-indicator>
            <p>Carregando seus dados...</p>
          </div>
        }

        @if ((currentProfessional$ | async); as professional) {
          @if (!(isLoading$ | async)) {
          <!-- Top KPI Cards -->
          <section class="kpi-section">
            <div class="kpi-card kpi-patients" (mouseenter)="onKpiHover('patients')" (mouseleave)="onKpiHover(null)">
              <div class="kpi-icon">👥</div>
              <div class="kpi-content">
                <div class="kpi-label">Pacientes Ativos</div>
                <div class="kpi-value">{{ professional.totalPatients }}</div>
              </div>
              <div class="kpi-accent"></div>
            </div>

            <div class="kpi-card kpi-rating">
              <div class="kpi-icon">⭐</div>
              <div class="kpi-content">
                <div class="kpi-label">Avaliação Média</div>
                <div class="kpi-value">{{ professional.averageRating || 0 }}/5</div>
              </div>
              <div class="kpi-accent"></div>
            </div>

            <div class="kpi-card kpi-slots">
              <div class="kpi-icon">📅</div>
              <div class="kpi-content">
                <div class="kpi-label">Horários Livres</div>
                <div class="kpi-value">{{ getAvailableSlots() }}</div>
              </div>
              <div class="kpi-accent"></div>
            </div>

            <div class="kpi-card kpi-revenue">
              <div class="kpi-icon">💰</div>
              <div class="kpi-content">
                <div class="kpi-label">Faturamento Potencial</div>
                <div class="kpi-value">R$ {{ ((professional?.consultationPrice || 0) * (professional?.totalPatients || 0)) | number: '1.2-2' }}</div>
              </div>
              <div class="kpi-accent"></div>
            </div>
          </section>

          <!-- Professional Profile Section -->
          <section class="professional-profile-section">
            <div class="section-header">
              <h2 class="section-title">Seu Perfil Profissional</h2>
              <app-primary-button
                label="Editar Perfil"
                (onClick)="editProfile(professional.id)"
                class="edit-btn"
              ></app-primary-button>
            </div>

            <div class="profile-card">
              <div class="profile-header-section">
                <div class="profile-badge">
                  <div class="profile-avatar">{{ professional.fullName.charAt(0).toUpperCase() }}</div>
                </div>

                <div class="profile-info">
                  <h3 class="profile-name">{{ professional.fullName }}</h3>
                  <p class="profile-crp-badge">
                    <span class="badge-icon">🎓</span>
                    <code>{{ professional.crp }}</code>
                  </p>
                  <p class="profile-specialty">{{ professional.specialties }}</p>
                </div>

                <div class="availability-indicator" [class.available]="professional.availableForNewPatients">
                  <span class="status-dot"></span>
                  <span class="status-label">
                    {{ professional.availableForNewPatients ? 'Disponível' : 'Indisponível' }}
                  </span>
                </div>
              </div>

              <div class="profile-details-grid">
                <div class="detail-box">
                  <label class="detail-label">💼 Localização</label>
                  <p class="detail-value">
                    {{ professional.address.street }}, 
                    {{ professional.address.city }} - 
                    {{ professional.address.state }}
                  </p>
                </div>

                <div class="detail-box">
                  <label class="detail-label">💵 Taxa da Consulta</label>
                  <p class="detail-value">R$ {{ professional.consultationPrice | number: '1.2-2' }}/hora</p>
                </div>

                <div class="detail-box">
                  <label class="detail-label">📝 Descrição</label>
                  <p class="detail-value">{{ professional.description || 'Sem descrição' }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Professional Details Section -->
          @if (professionalProfile$ | async; as profile) {
            <section class="professional-details-section">
            <div class="section-header">
              <h2 class="section-title">Informações Profissionais Detalhadas</h2>
              <app-primary-button
                label="Atualizar Dados"
                (onClick)="editProfessionalDetails(professional.id)"
                class="edit-btn"
              ></app-primary-button>
            </div>

            <div class="details-grid-container">
              <div class="detail-card">
                <div class="detail-card-icon">🎓</div>
                <div class="detail-card-content">
                  <h4>Formação Acadêmica</h4>
                  <p>{{ profile.education || 'Não informado' }}</p>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-card-icon">⏳</div>
                <div class="detail-card-content">
                  <h4>Experiência</h4>
                  <p>{{ profile.yearsOfExperience }} anos atuando</p>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-card-icon">🧠</div>
                <div class="detail-card-content">
                  <h4>Abordagens Terapêuticas</h4>
                  <p>{{ profile.therapeuticApproaches || 'Não informado' }}</p>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-card-icon">👥</div>
                <div class="detail-card-content">
                  <h4>Populações Atendidas</h4>
                  <p>{{ profile.populationsServed || 'Não informado' }}</p>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-card-icon">🗣️</div>
                <div class="detail-card-content">
                  <h4>Idiomas</h4>
                  <p>{{ profile.languages || 'Não informado' }}</p>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-card-icon">🎯</div>
                <div class="detail-card-content">
                  <h4>Modalidades</h4>
                  <div class="badge-group">
                    @if (profile.officeConsultation) {
                      <span class="badge presencial">Presencial</span>
                    }
                    @if (profile.onlineConsultation) {
                      <span class="badge online">Online</span>
                    }
                  </div>
                </div>
              </div>
            </div>
            </section>
          }
          }

          <!-- Quick Actions Section -->
          <section class="actions-section">
            <h2 class="section-title">Ações Rápidas</h2>
            <div class="actions-grid">
              <button class="action-card" (click)="viewPatients()" title="Visualizar Pacientes">
                <div class="action-icon">👥</div>
                <div class="action-label">Meus Pacientes</div>
                <div class="action-arrow">→</div>
              </button>

              <button class="action-card" (click)="viewSchedule()" title="Ver Agenda">
                <div class="action-icon">📅</div>
                <div class="action-label">Minha Agenda</div>
                <div class="action-arrow">→</div>
              </button>

              <button class="action-card" (click)="scheduleConsultation()" title="Agendar Consulta">
                <div class="action-icon">⏰</div>
                <div class="action-label">Agendar Consulta</div>
                <div class="action-arrow">→</div>
              </button>

              <button class="action-card" (click)="openSettings()" title="Configurações">
                <div class="action-icon">⚙️</div>
                <div class="action-label">Configurações</div>
                <div class="action-arrow">→</div>
              </button>
            </div>
          </section>

          <!-- Availability Toggle Section -->
          <section class="availability-section">
            <h2 class="section-title">Status de Disponibilidade</h2>
            <div class="availability-card" [class.available]="professional.availableForNewPatients">
              <div class="availability-content">
                <div class="availability-status-info">
                  <div class="status-circle" [class.active]="professional.availableForNewPatients"></div>
                  <div>
                    <p class="status-heading">
                      {{ professional.availableForNewPatients ? 'Disponível para Novos Pacientes' : 'Indisponível para Novos Pacientes' }}
                    </p>
                    <p class="status-description">
                      {{ professional.availableForNewPatients 
                        ? 'Você está aceitando novos pacientes neste momento' 
                        : 'Você não está aceitando novos pacientes no momento' }}
                    </p>
                  </div>
                </div>
                <button 
                  class="toggle-availability-btn"
                  [class.active]="professional.availableForNewPatients"
                  (click)="toggleAvailability(professional)"
                  [attr.aria-label]="'Alternar disponibilidade'"
                >
                  <span class="toggle-switch"></span>
                </button>
              </div>
            </div>
          </section>
        }
      </main>
    </div>
  `
})
export class ProfessionalDashboardComponent implements OnInit {
  currentProfessional$ = new BehaviorSubject<Professional | null>(null);
  professionalProfile$ = new BehaviorSubject<any | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(true);
  hoveredKpi: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private professionalService: ProfessionalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfessionalData();
  }

  onKpiHover(kpiId: string | null): void {
    this.hoveredKpi = kpiId;
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
                  console.log(JSON.stringify(professional));
                  this.professionalProfile$.next(profile);
                },
                error: (error) => {
                  console.error('Erro ao carregar perfil:', error);
                }
              });
          },
          error: (error) => {
            console.error('Erro ao carregar profissional:', error);
            this.router.navigate(['/']);
          }
        });
    } else {
      this.router.navigate(['/']);
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
