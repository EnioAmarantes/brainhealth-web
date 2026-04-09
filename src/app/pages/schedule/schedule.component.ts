import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { ProfessionalService } from '@app/services/professional.service';
import { Professional } from '@app/models/professional.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-schedule',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        LoadingIndicatorComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="schedule-container">
      <div class="schedule-header">
        <h1>Agendar Consulta</h1>
        <app-secondary-button
          label="← Voltar"
          (onClick)="navigateBack()"
        ></app-secondary-button>
      </div>

      <app-card [elevated]="true">
        <div *ngIf="professional$ | async as professional" class="schedule-content">
          <div class="professional-info">
            <h2>{{ professional.name }}</h2>
            <p class="specialty">{{ professional.specialties.join(', ') }}</p>
          </div>

          <form [formGroup]="scheduleForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="date">Data Desejada</label>
              <input
                id="date"
                type="datetime-local"
                formControlName="date"
                [min]="minDate"
              />
            </div>

            <div class="form-group">
              <label for="reason">Motivo da Consulta</label>
              <textarea
                id="reason"
                formControlName="reason"
                placeholder="Descreva brevemente o motivo de sua consulta..."
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="notes">Observações Adicionais</label>
              <textarea
                id="notes"
                formControlName="notes"
                placeholder="Alguma observação adicional?"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <app-secondary-button
                label="Cancelar"
                (onClick)="navigateBack()"
              ></app-secondary-button>
              <app-primary-button
                label="Agendar"
                [disabled]="scheduleForm.invalid"
                [isLoading]="(isSubmitting$ | async)!"
                (onClick)="onSubmit()"
              ></app-primary-button>
            </div>
          </form>
        </div>
      </app-card>

      <app-loading-indicator></app-loading-indicator>
    </div>
  `,
    styles: [`
    .schedule-container {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .schedule-header {
      max-width: 600px;
      margin: 0 auto 30px;
      color: white;

      h1 {
        font-size: 32px;
        margin: 0 0 20px 0;
      }
    }

    app-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .schedule-content {
      .professional-info {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;

        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #333;
        }

        .specialty {
          margin: 0;
          font-size: 14px;
          color: #667eea;
          font-weight: 600;
        }
      }

      form {
        margin-bottom: 20px;
      }

      .form-group {
        margin-bottom: 20px;

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        input,
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }

        textarea {
          resize: vertical;
        }
      }

      .form-actions {
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
export class ScheduleComponent implements OnInit {
  professional$!: Observable<Professional>;
  scheduleForm!: FormGroup;
  isSubmitting$ = new BehaviorSubject<boolean>(false as boolean);
  minDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['professionalId'];
      this.professional$ = this.professionalService.getProfessionalById(id);
    });

    this.initializeForm();
    this.setMinDate();
  }

  private initializeForm(): void {
    this.scheduleForm = this.fb.group({
      date: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      notes: ['']
    });
  }

  private setMinDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      this.isSubmitting$.next(true);
      // Aqui integraria com o backend para agendar a consulta
      setTimeout(() => {
        this.isSubmitting$.next(false);
        alert('Consulta agendada com sucesso!');
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/professionals']);
  }
}
