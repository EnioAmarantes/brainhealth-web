import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent, LoadingIndicatorComponent, WhatsAppButtonComponent } from '@app/components/shared';
import { ProfessionalService } from '@app/services/professional.service';
import { AuthService } from '@app/services/auth.service';
import { WhatsAppService, WhatsAppConsultationData } from '@app/services/whatsapp.service';
import { Professional } from '@app/models/professional.model';
import { Observable, combineLatest, map, catchError, of } from 'rxjs';

@Component({
    selector: 'app-professional-detail',
    imports: [
        CommonModule,
        CardComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        LoadingIndicatorComponent,
        WhatsAppButtonComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="detail-container">
      <div class="detail-header">
        <app-secondary-button
          label="← Voltar"
          (onClick)="navigateBack()"
        ></app-secondary-button>
      </div>

      <ng-container *ngIf="detailData$ | async as data">
        <!-- Erro ao carregar profissional -->
        <app-card [elevated]="true" *ngIf="!data.professional.id">
          <div class="error-message">
            <h2>Profissional não encontrado</h2>
            <p>Desculpe, não conseguimos carregar os dados do profissional solicitado.</p>
            <app-secondary-button
              label="Voltar"
              (onClick)="navigateBack()"
            ></app-secondary-button>
          </div>
        </app-card>

        <!-- Versão Completa - Usuário Logado -->
        <app-card [elevated]="true" *ngIf="data.professional.id && data.isAuthenticated">
          <div class="professional-detail">
            <h1>{{ data.professional.fullName }}</h1>
            <div class="specialties">
              <span class="specialty" *ngFor="let specialty of data.professional.specialties">
                {{ specialty }}
              </span>
            </div>

            <div class="meta-info">
              <p><strong>Experiência:</strong> {{ data.professional.experience }} anos</p>
              <p *ngIf="data.professional.crp"><strong>CRP:</strong> {{ data.professional.crp }}</p>
              <p *ngIf="data.professional.consultationPrice"><strong>Valor da Consulta:</strong> R$ {{ data.professional.consultationPrice | number: '1.2-2' }}</p>
            </div>

            <div class="description">
              <h3>Sobre</h3>
              <p>{{ data.professional.description }}</p>
            </div>

            <div class="location">
              <h3>Localização</h3>
              <p>{{ data.professional.address.street }}<br>
                 {{ data.professional.address.city }}, {{ data.professional.address.state }}<br>
                 {{ data.professional.address.zipCode }}, {{ data.professional.address.country }}</p>
            </div>

            <div class="actions">
              <app-primary-button
                label="Agendar Consulta"
                (onClick)="scheduleConsultation(data.professional.id)"
              ></app-primary-button>
            </div>
          </div>
        </app-card>

        <!-- Versão Resumida - Usuário Não Logado -->
        <app-card [elevated]="true" *ngIf="data.professional.id && !data.isAuthenticated">
          <div class="professional-detail professional-summary">
            <h1>{{ data.professional.fullName }}</h1>
            <div class="specialties">
              <span class="specialty" *ngFor="let specialty of data.professional.specialties">
                {{ specialty }}
              </span>
            </div>

            <div class="experience-preview">
              <p><strong>Experiência:</strong> {{ data.professional.experience }} anos</p>
            </div>

            <div class="description">
              <h3>Sobre</h3>
              <p class="summary-text">{{ data.professional.description | slice:0:300 }}...</p>
              <p class="login-prompt">Faça login para ver o perfil completo do profissional</p>
            </div>

            <div class="actions-unauthenticated">
              <app-whatsapp-button
                label="WhatsApp"
                (onClick)="contactViaWhatsApp(data.professional)"
              ></app-whatsapp-button>
              <app-secondary-button
                label="Fazer Login"
                (onClick)="goToLogin()"
              ></app-secondary-button>
            </div>
          </div>
        </app-card>
      </ng-container>

      <app-loading-indicator></app-loading-indicator>
    </div>
  `,
    styles: [`
    .detail-container {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .detail-header {
      max-width: 900px;
      margin: 0 auto 30px;
    }

    app-card {
      max-width: 900px;
      margin: 0 auto;
    }

    .professional-detail {
      h1 {
        margin: 0 0 16px 0;
        font-size: 32px;
        color: #333;
      }

      .specialties {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;

        .specialty {
          background: #f0f0f0;
          color: #667eea;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
      }

      .meta-info,
      .experience-preview,
      .description,
      .location {
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e0e0e0;

        h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: #333;
        }

        p {
          margin: 0 0 8px 0;
          line-height: 1.6;
          color: #666;
        }
      }

      .location {
        border-bottom: none;

        p {
          font-size: 14px;
        }
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
        }
      }
    }

    .professional-summary {
      .summary-text {
        color: #666;
        line-height: 1.6;
      }

      .login-prompt {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 8px;
        color: #667eea;
        font-style: italic;
        margin-top: 12px;
        border-left: 4px solid #667eea;
      }

      .actions-unauthenticated {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
        }
      }
    }

    .error-message {
      text-align: center;
      padding: 40px 20px;

      h2 {
        margin: 0 0 16px 0;
        font-size: 24px;
        color: #d32f2f;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
        font-size: 16px;
      }
    }
  `]
})
export class ProfessionalDetailComponent implements OnInit {
  professional$!: Observable<Professional>;
  detailData$!: Observable<{ professional: Professional; isAuthenticated: boolean }>;

  constructor(
    private route: ActivatedRoute,
    private professionalService: ProfessionalService,
    private authService: AuthService,
    private whatsAppService: WhatsAppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.professional$ = this.professionalService.getProfessionalById(id).pipe(
        catchError(error => {
          console.error('Erro ao carregar profissional:', error);
          return of(null as any);
        })
      );

      // Combina os dados do profissional com o status de autenticação
      this.detailData$ = combineLatest([
        this.professional$,
        this.authService.isAuthenticated$
      ]).pipe(
        map(([professional, isAuthenticated]) => ({
          professional: professional || {} as Professional,
          isAuthenticated
        })),
        catchError(error => {
          console.error('Erro ao combinar dados:', error);
          return of({ professional: {} as Professional, isAuthenticated: false });
        })
      );
    });
  }

  scheduleConsultation(professionalId: string): void {
    this.router.navigate(['/schedule', professionalId]);
  }

  contactViaWhatsApp(professional: Professional): void {
    // Obter dados necessários para o WhatsApp
    const whatsAppData: WhatsAppConsultationData = {
      professionalPhoneNumber: professional.phoneNumber || '',
      professionalName: professional.fullName,
      patientDescription: 'Gostaria de marcar uma consulta',
      aiAnalysisSynthesis: '',
      identifiedIssues: [],
      recommendedSpecialties: professional.specialties,
      urgencyLevel: 'normal'
    };

    const whatsAppLink = this.whatsAppService.generateWhatsAppLink(whatsAppData);
    window.open(whatsAppLink, '_blank');
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }

  navigateBack(): void {
    this.router.navigate(['/professionals']);
  }
}
