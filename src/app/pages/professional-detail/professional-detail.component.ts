import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { ProfessionalService } from '@app/services/professional.service';
import { Professional } from '@app/models/professional.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-professional-detail',
    imports: [
        CommonModule,
        CardComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        LoadingIndicatorComponent
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

      <app-card [elevated]="true" *ngIf="professional$ | async as professional">
        <div class="professional-detail">
          <h1>{{ professional.fullName }}</h1>
          <div class="specialties">
            <span class="specialty" *ngFor="let specialty of professional.specialties">
              {{ specialty }}
            </span>
          </div>

          <div class="meta-info">
            <p><strong>Experiência:</strong> {{ professional.experience }} anos</p>
            <p *ngIf="professional.crp"><strong>CRP:</strong> {{ professional.crp }}</p>
            <p *ngIf="professional.consultationPrice"><strong>Valor da Consulta:</strong> R$ {{ professional.consultationPrice | number: '1.2-2' }}</p>
          </div>

          <div class="description">
            <h3>Sobre</h3>
            <p>{{ professional.description }}</p>
          </div>

          <div class="location">
            <h3>Localização</h3>
            <p>{{ professional.address.street }}<br>
               {{ professional.address.city }}, {{ professional.address.state }}<br>
               {{ professional.address.zipCode }}, {{ professional.address.country }}</p>
          </div>

          <div class="actions">
            <app-primary-button
              label="Agendar Consulta"
              (onClick)="scheduleConsultation(professional.id)"
            ></app-primary-button>
          </div>
        </div>
      </app-card>

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
  `]
})
export class ProfessionalDetailComponent implements OnInit {
  professional$!: Observable<Professional>;

  constructor(
    private route: ActivatedRoute,
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.professional$ = this.professionalService.getProfessionalById(id);
    });
  }

  scheduleConsultation(professionalId: string): void {
    this.router.navigate(['/schedule', professionalId]);
  }

  navigateBack(): void {
    this.router.navigate(['/professionals']);
  }
}
