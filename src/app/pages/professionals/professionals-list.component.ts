import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { ProfessionalService } from '@app/services/professional.service';
import { Professional, PaginatedResult } from '@app/models/professional.model';
import { map, Observable } from 'rxjs';

@Component({
    selector: 'app-professionals-list',
    imports: [
        CommonModule,
        CardComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        LoadingIndicatorComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="professionals-container">
      <div class="professionals-header">
        <h1>Profissionais Recomendados</h1>
        <p class="subtitle">Escolha o melhor profissional para você</p>
        <app-secondary-button
          label="← Voltar"
          (onClick)="navigateBack()"
        ></app-secondary-button>
      </div>

      <div class="professionals-list">
        <app-card [elevated]="true" *ngFor="let professional of (professionals$ | async)?.items">
          <div class="professional-card">
            <div class="professional-header">
              <div class="professional-info">
                <h3>{{ professional.name }}</h3>
                <div class="specialties">
                  <span class="specialty" *ngFor="let specialty of professional.specialties">
                    {{ specialty }}
                  </span>
                </div>
              </div>
              <div class="rating">
                <span class="stars">★★★★★</span>
                <span class="score">{{ professional.rating }}/5</span>
                <span class="reviews">({{ professional.reviews }} avaliações)</span>
              </div>
            </div>

            <div class="professional-details">
              <p class="description">{{ professional.description }}</p>
              <div class="meta">
                <span *ngIf="professional.crp">CRP: {{ professional.crp }}</span>
                <span>{{ professional.experience }} anos de experiência</span>
                <span *ngIf="professional.consultationPrice">R$ {{ professional.consultationPrice | number: '1.2-2' }}/consulta</span>
              </div>
            </div>

            <div class="professional-location">
              <span class="icon">📍</span>
              {{ professional.address.street }}, {{ professional.address.city }} - {{ professional.address.state }}
            </div>

            <div class="actions">
              <app-primary-button
                label="Ver Detalhes"
                (onClick)="viewDetails(professional.id)"
              ></app-primary-button>
              <app-secondary-button
                label="Agendar Consulta"
                (onClick)="scheduleConsultation(professional.id)"
              ></app-secondary-button>
            </div>
          </div>
        </app-card>

        <div class="no-results" *ngIf="!(professionals$ | async)?.items?.length">
          <p>Nenhum profissional encontrado com os critérios selecionados.</p>
          <app-secondary-button
            label="Tentar Novamente"
            (onClick)="navigateBack()"
          ></app-secondary-button>
        </div>
      </div>

      <app-loading-indicator></app-loading-indicator>
    </div>
  `,
    styles: [`
    .professionals-container {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .professionals-header {
      max-width: 900px;
      margin: 0 auto 40px;
      color: white;
      animation: slideDown 0.6s ease-out;

      h1 {
        font-size: 36px;
        margin: 0 0 12px 0;
      }

      .subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 24px;
      }
    }

    .professionals-list {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      gap: 24px;
      animation: slideUp 0.8s ease-out;

      .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;

        p {
          font-size: 18px;
          color: #666;
          margin-bottom: 24px;
        }
      }
    }

    .professional-card {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .professional-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;

        @media (max-width: 480px) {
          flex-direction: column;
        }

        .professional-info {
          flex: 1;

          h3 {
            margin: 0 0 8px 0;
            font-size: 22px;
            color: #333;
          }

          .specialties {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .specialty {
              background: #f0f0f0;
              color: #667eea;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
          }
        }

        .rating {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;

          @media (max-width: 480px) {
            align-items: flex-start;
          }

          .stars {
            font-size: 18px;
            color: #ffc107;
          }

          .score {
            font-weight: 600;
            color: #333;
          }

          .reviews {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .professional-details {
        .description {
          margin: 0 0 12px 0;
          color: #555;
          line-height: 1.6;
          font-size: 14px;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 12px;
          color: #666;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .professional-location {
        padding: 12px;
        background: #f9f9f9;
        border-radius: 8px;
        font-size: 14px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 8px;

        .icon {
          font-size: 16px;
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

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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
export class ProfessionalsListComponent implements OnInit {
  professionals$!: Observable<PaginatedResult<Professional>>;

  constructor(
    private professionalService: ProfessionalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['specialties']) {
        const specialties = params['specialties'].split(',');
        this.professionals$ = this.professionalService
          .getRecommendedProfessionals(specialties)
          .pipe(
            map((professionals: Professional[]) => ({
              items: professionals,
              total: professionals.length,
              page: 1,
              pageSize: professionals.length,
              totalPages: 1
            }))
          );
      }
    });
  }

  viewDetails(professionalId: string): void {
    this.router.navigate(['/professional', professionalId]);
  }

  scheduleConsultation(professionalId: string): void {
    this.router.navigate(['/schedule', professionalId]);
  }

  navigateBack(): void {
    this.router.navigate(['/questionnaire']);
  }
}
