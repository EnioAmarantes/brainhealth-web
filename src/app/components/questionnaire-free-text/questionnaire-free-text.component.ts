import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardComponent, PrimaryButtonComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { AIAnalysisService, AIAnalysisResponse, RecommendedProfessionalsResponse } from '@app/services/ai-analysis.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-questionnaire-free-text',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    PrimaryButtonComponent,
    LoadingIndicatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="free-text-container">
      <app-card [elevated]="true">
        <div class="card-header">
          <h2>Descreva o que Você Sente</h2>
          <p class="subtitle">
            Compartilhe de forma livre e detalhada qual é o problema que você enfrenta.
            Essa informação nos ajudará a encontrar o profissional mais adequado para você.
          </p>
        </div>

        <form [formGroup]="freeTextForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="freeTextDescription">
              Descrição do Problema
              <span class="required">*</span>
            </label>
            <textarea
              id="freeTextDescription"
              formControlName="freeTextDescription"
              placeholder="Ex: Tenho sentido muita ansiedade nos últimos meses, especialmente antes de reuniões importantes. Também tenho dificuldade para dormir e me sinto cansado o tempo todo..."
              rows="6"
              [disabled]="isLoading"
              (input)="onDescriptionChange()"
            ></textarea>
            <div class="char-count">
              {{ characterCount }}/500 caracteres
            </div>
            <div class="error-message" *ngIf="hasError('freeTextDescription', 'required')">
              Por favor, descreva o que você sente.
            </div>
            <div class="error-message" *ngIf="hasError('freeTextDescription', 'minlength')">
              Mínimo de 10 caracteres necessário.
            </div>
          </div>

          <div class="form-actions">
            <app-primary-button
              [label]="isLoading ? 'Analisando...' : 'Analisar e Encontrar Profissionais'"
              (onClick)="onSubmit()"
              [disabled]="!freeTextForm.valid || isLoading"
            ></app-primary-button>
          </div>

          <app-loading-indicator *ngIf="isLoading"></app-loading-indicator>

          <div class="info-box">
            <p>
              <strong>ℹ️ Como funciona:</strong>
              Usamos Inteligência Artificial para analisar sua descrição e identificar os problemas principais,
              depois encontramos os profissionais mais especializados em atender suas necessidades.
            </p>
          </div>
        </form>
      </app-card>

      <!-- Results Section -->
      <div *ngIf="analysisResult" class="results-section">
        <app-card [elevated]="true" class="analysis-result">
          <h3>Resultado da Análise</h3>
          <p class="synthesis">{{ analysisResult.synthesis }}</p>

          <div class="issues-found">
            <h4>Problemas Identificados:</h4>
            <ul>
              <li *ngFor="let issue of analysisResult.identifiedIssues">{{ issue }}</li>
            </ul>
          </div>

          <div class="specialties-found">
            <h4>Especialidades Recomendadas:</h4>
            <ul>
              <li *ngFor="let specialty of analysisResult.recommendedSpecialties">{{ specialty }}</li>
            </ul>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .free-text-container {
      padding: 1.5rem;
      max-width: 700px;
      margin: 0 auto;
    }

    .card-header {
      margin-bottom: 2rem;
    }

    .card-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .required {
      color: #dc3545;
    }

    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      transition: border-color 0.3s;
    }

    textarea:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    textarea:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .char-count {
      margin-top: 0.3rem;
      text-align: right;
      font-size: 0.8rem;
      color: #999;
    }

    .error-message {
      margin-top: 0.3rem;
      color: #dc3545;
      font-size: 0.85rem;
    }

    .form-actions {
      margin-bottom: 1rem;
    }

    .info-box {
      background: #e8f4f8;
      border-left: 4px solid #0066cc;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1.5rem;
    }

    .info-box p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #333;
    }

    .results-section {
      margin-top: 2rem;
    }

    .analysis-result {
      background: #f9f9f9;
    }

    .analysis-result h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .synthesis {
      background: white;
      padding: 1rem;
      border-radius: 4px;
      line-height: 1.6;
      color: #555;
      margin-bottom: 1rem;
    }

    .issues-found,
    .specialties-found {
      margin-bottom: 1rem;
    }

    .issues-found h4,
    .specialties-found h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 0.95rem;
    }

    .issues-found ul,
    .specialties-found ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #555;
    }

    .issues-found li,
    .specialties-found li {
      margin-bottom: 0.3rem;
    }
  `]
})
export class QuestionnaireFreeTextComponent implements OnInit {
  @Input() isLoading = false;
  @Output() descriptionSubmitted = new EventEmitter<string>();
  @Output() resultReady = new EventEmitter<RecommendedProfessionalsResponse>();

  freeTextForm!: FormGroup;
  characterCount = 0;
  analysisResult: AIAnalysisResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private aiAnalysisService: AIAnalysisService
  ) {
    this.freeTextForm = this.fb.group({
      freeTextDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.freeTextForm.patchValue({
      freeTextDescription: ''
    });
  }

  onDescriptionChange(): void {
    const description = this.freeTextForm.get('freeTextDescription')?.value || '';
    this.characterCount = description.length;
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.freeTextForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (!this.freeTextForm.valid) {
      return;
    }

    const description = this.freeTextForm.get('freeTextDescription')?.value;
    this.isLoading = true;

    this.aiAnalysisService.analyzeAndRecommend({
      patientDescription: description
    })
      .pipe(
        catchError((error) => {
          console.error('Erro ao analisar descrição:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((result) => {
        if (result) {
          this.analysisResult = {
            synthesis: result.problemSynthesis,
            identifiedIssues: result.identifiedIssues,
            recommendedSpecialties: result.recommendedSpecialties,
            urgencyLevel: result.urgencyLevel as any,
            generalRecommendations: result.generalRecommendations
          };
          this.resultReady.emit(result);
          this.descriptionSubmitted.emit(description);
        }
      });
  }
}
