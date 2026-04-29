import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent, LoadingIndicatorComponent, WhatsAppButtonComponent } from '@app/components/shared';
import { QuestionnaireService } from '@app/services/questionnaire.service';
import { AIAnalysisService, RecommendedProfessionalsResponse } from '@app/services/ai-analysis.service';
import { QuestionnaireSessionService } from '@app/services/questionnaire-session.service';
import { WhatsAppService } from '@app/services/whatsapp.service';
import { Questionnaire, Question, QuestionType } from '@app/models/questionnaire.model';
import { catchError, finalize } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-questionnaire',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        LoadingIndicatorComponent,
        WhatsAppButtonComponent
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    template: `
    <!-- Step 1: Unified Questionnaire + Free Text -->
    <ng-container *ngIf="currentStep === 'questionnaire'">
      <div class="questionnaire-container">
        <div class="questionnaire-box">
          <app-card [elevated]="true">
            <div class="progress-bar">
              <div class="progress" [style.width.%]="getProgress()"></div>
            </div>

            <h1>Questionário de Triagem</h1>
            <p class="subtitle">Responda algumas perguntas para encontrar o profissional ideal</p>

            <form [formGroup]="questionnaireForm" *ngIf="questionnaire">
              <div *ngFor="let question of questionnaire.questions" class="question-group">
                <label [for]="question.id">
                  {{ question.text }}
                  <span class="required" *ngIf="question.required">*</span>
                </label>

                <div [ngSwitch]="question.type">
                  <!-- Multiple Choice -->
                  <div *ngSwitchCase="QuestionType.MULTIPLE_CHOICE" class="options">
                    <select [id]="question.id" [formControlName]="question.id" [attr.aria-label]="question.text">
                      <option value="">Selecione uma opção</option>
                      <option *ngFor="let option of question.options" [value]="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>

                  <!-- Checkboxes -->
                  <div *ngSwitchCase="QuestionType.CHECKBOX" class="checkboxes">
                    <div *ngFor="let option of question.options" class="checkbox-item">
                      <input
                        type="checkbox"
                        [id]="option.id"
                        [value]="option.value"
                        (change)="onCheckboxChange($event, question.id)"
                        [attr.aria-label]="option.text"
                      />
                      <label [for]="option.id">{{ option.text }}</label>
                    </div>
                  </div>

                  <!-- Text -->
                  <div *ngSwitchCase="QuestionType.TEXT">
                    <textarea
                      [id]="question.id"
                      [formControlName]="question.id"
                      placeholder="Sua resposta aqui..."
                      [attr.aria-label]="question.text"
                      rows="4"
                    ></textarea>
                  </div>

                  <!-- Scale -->
                  <div *ngSwitchCase="QuestionType.SCALE" class="scale">
                    <div class="scale-options">
                      <label *ngFor="let i of [1, 2, 3, 4, 5]">
                        <input
                          type="radio"
                          [value]="i"
                          [formControlName]="question.id"
                          [attr.aria-label]="'Escala: ' + i"
                        />
                        <span>{{ i }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Free Text Description - Now part of the same form -->
              <div class="form-group free-text-section">
                <label for="freeTextDescription">
                  Descrição do Seu Problema
                  <span class="required">*</span>
                </label>
                <textarea
                  id="freeTextDescription"
                  formControlName="freeTextDescription"
                  placeholder="Ex: Tenho sentido muita ansiedade nos últimos meses, especialmente antes de reuniões importantes. Também tenho dificuldade para dormir..."
                  rows="6"
                  [disabled]="isAnalyzing"
                  (input)="onDescriptionChange()"
                ></textarea>
                <div class="char-count">
                  {{ characterCount }}/500 caracteres
                </div>
                <div class="error-message" *ngIf="freeTextForm.get('freeTextDescription')?.hasError('required') && freeTextForm.get('freeTextDescription')?.touched">
                  Por favor, descreva o que você sente.
                </div>
              </div>

              <div class="form-actions">
                <app-secondary-button
                  label="Cancelar"
                  (onClick)="navigateBack()"
                ></app-secondary-button>
                <app-primary-button
                  label="Analisar com IA"
                  [disabled]="questionnaireForm.invalid || freeTextForm.invalid || isAnalyzing"
                  [isLoading]="isAnalyzing"
                  (onClick)="onSubmitFreeText()"
                ></app-primary-button>
              </div>
            </form>

            <app-loading-indicator *ngIf="isAnalyzing"></app-loading-indicator>
          </app-card>
        </div>
      </div>
    </ng-container>

    <!-- Step 2: Results -->
    <ng-container *ngIf="currentStep === 'results'">
      <div class="results-container">
        <app-card [elevated]="true">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="100"></div>
          </div>

          <div *ngIf="recommendedProfessionals$ | async as response">
            <div class="results-header">
              <h1>Profissionais Recomendados</h1>
              <div class="urgency-badge" [style.backgroundColor]="getUrgencyColor(response.urgencyLevel)">
                Urgência: {{ translateUrgency(response.urgencyLevel) }}
              </div>
            </div>

            <div class="problem-summary">
              <h2>Síntese do Problema</h2>
              <p>{{ response.problemSynthesis }}</p>
            </div>

            <div class="issues-identified">
              <h3>Problemas Identificados:</h3>
              <div class="tags">
                <span *ngFor="let issue of response.identifiedIssues" class="tag issue-tag">
                  {{ issue }}
                </span>
              </div>
            </div>

            <div class="specialties">
              <h3>Especialidades Recomendadas:</h3>
              <div class="tags">
                <span *ngFor="let specialty of response.recommendedSpecialties" class="tag specialty-tag">
                  {{ specialty }}
                </span>
              </div>
            </div>

            <div class="professionals-list">
              <h2>Profissionais Disponíveis: {{ response.totalAvailable }}</h2>
              
              <div *ngIf="response.recommendedProfessionals.length === 0" class="no-professionals">
                <p>Nenhum profissional disponível no momento.</p>
              </div>

              <div class="professionals-grid">
                <app-card *ngFor="let professional of response.recommendedProfessionals" class="professional-card">
                  <div class="professional-header">
                    <div>
                      <h3>{{ professional.name }}</h3>
                      <p class="location">📍 {{ professional.location }}</p>
                    </div>
                    <div class="compatibility">
                      <div class="score" [style.backgroundColor]="getScoreColor(professional.compatibilityScore)">
                        {{ professional.compatibilityScore }}%
                      </div>
                    </div>
                  </div>

                  <div class="professional-details">
                    <p><strong>Especialidade:</strong> {{ professional.specialties }}</p>
                    <p *ngIf="professional.bio"><strong>Bio:</strong> {{ professional.bio }}</p>
                    <p><strong>Avaliação:</strong> ⭐ {{ professional.averageRating }}/5 ({{ professional.totalPatients }} pacientes)</p>
                    <p><strong>Taxa:</strong> R$ {{ professional.consultationPrice | number: '1.2-2' }}</p>
                    <p *ngIf="professional.recommendationReason"><strong>Motivo:</strong> {{ professional.recommendationReason }}</p>
                  </div>

                  <div class="professional-actions">
                    <app-primary-button
                      label="Ver Perfil"
                      (onClick)="viewProfessional(professional.id)"
                    ></app-primary-button>
                    <app-whatsapp-button
                      label="WhatsApp"
                      (onClick)="scheduleProfessional(professional.id)"
                    ></app-whatsapp-button>
                  </div>
                </app-card>
              </div>
            </div>

            <div class="action-buttons">
              <app-secondary-button
                label="Voltar"
                (onClick)="goToQuestionnaire()"
              ></app-secondary-button>
              <app-primary-button
                label="Ir para Profissionais"
                (onClick)="goToProfessionals()"
              ></app-primary-button>
            </div>
          </div>
        </app-card>
      </div>
    </ng-container>
  `,
    styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
      border: 0;
    }

    .questionnaire-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      width: 100%;
      margin: 0;
      border: 0;
    }

    .questionnaire-box,
    .free-text-box,
    .results-box {
      width: 100%;
      max-width: 100%;
      padding: 60px;
      animation: slideUp 0.6s ease-out;
      margin: 0;
      border: 0;

      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        text-align: center;
        color: #333;
      }

      .subtitle {
        margin: 0 0 24px 0;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
    }

    .results-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow-y: auto;
      width: 100%;
      margin: 0;
      border: 0;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      margin-bottom: 24px;
      overflow: hidden;

      .progress {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.3s ease;
      }
    }

    form {
      margin-bottom: 24px;
    }

    .question-group,
    .form-group {
      margin-bottom: 28px;

      label {
        display: block;
        margin-bottom: 12px;
        font-weight: 600;
        color: #333;
        font-size: 16px;

        .required {
          color: #ff6b6b;
        }
      }

      select,
      textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.3s ease;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      }

      textarea {
        resize: vertical;
      }

      &.free-text-section {
        border-top: 2px solid #e0e0e0;
        padding-top: 24px;
        margin-top: 32px;
      }

      .options {
        select {
          cursor: pointer;
        }
      }

      .checkboxes {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;

          input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }

          label {
            margin: 0;
            font-weight: 400;
            cursor: pointer;
            flex: 1;
          }
        }
      }

      .scale {
        .scale-options {
          display: flex;
          justify-content: space-between;
          gap: 8px;

          label {
            flex: 1;
            text-align: center;
            margin: 0;
            font-weight: 400;

            input {
              display: block;
              margin: 0 auto 8px;
              cursor: pointer;
            }

            span {
              display: block;
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }

    .char-count {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }

    .error-message {
      color: #ff6b6b;
      font-size: 12px;
      margin-top: 8px;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        flex: 1;
      }

      .urgency-badge {
        padding: 8px 16px;
        border-radius: 20px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .problem-summary {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      h2 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        line-height: 1.6;
      }
    }

    .issues-identified,
    .specialties {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #333;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;

          &.issue-tag {
            background-color: #e3f2fd;
            color: #1976d2;
          }

          &.specialty-tag {
            background-color: #f3e5f5;
            color: #7b1fa2;
          }
        }
      }
    }

    .professionals-list {
      margin-bottom: 24px;

      h2 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #333;
      }

      .no-professionals {
        text-align: center;
        padding: 24px;
        color: #999;
      }
    }

    .professionals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .professional-card {
        display: flex;
        flex-direction: column;

        .professional-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          h3 {
            margin: 0;
            font-size: 16px;
            color: #333;
          }

          .location {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #666;
          }

          .compatibility {
            .score {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
          }
        }

        .professional-details {
          flex: 1;
          margin-bottom: 16px;

          p {
            margin: 8px 0;
            font-size: 13px;
            color: #666;

            strong {
              color: #333;
            }
          }
        }

        .professional-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
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
export class QuestionnaireScreenComponent implements OnInit {
  questionnaireForm!: FormGroup;
  freeTextForm!: FormGroup;
  questionnaire$ = new BehaviorSubject<Questionnaire | null>(null);
  recommendedProfessionals$ = new BehaviorSubject<RecommendedProfessionalsResponse | null>(null);
  isAnalyzing$ = new BehaviorSubject<boolean>(false);
  currentStep$ = new BehaviorSubject<'questionnaire' | 'free-text' | 'results'>('questionnaire');
  currentStep: 'questionnaire' | 'free-text' | 'results' = 'questionnaire';
  questionnaire: Questionnaire | null = null;
  recommendedProfessionals: RecommendedProfessionalsResponse | null = null;
  isAnalyzing = false;
  QuestionType = QuestionType;
  characterCount = 0;

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireService,
    private aiAnalysisService: AIAnalysisService,
    private questionnaireSessionService: QuestionnaireSessionService,
    private whatsAppService: WhatsAppService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load questionnaire mock for testing (no backend dependency)
    this.loadMockQuestionnaire();
  }

  private loadMockQuestionnaire(): void {
    // Mock questionnaire for UI demonstration
    const mockQuestionnaire: Questionnaire = {
      id: 'screening-001',
      title: 'Questionário de Triagem',
      description: 'Avalie sua saúde mental',
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'q1',
          text: 'Como você tem se sentido ultimamente?',
          type: QuestionType.MULTIPLE_CHOICE,
          required: true,
          order: 1,
          options: [
            { id: 'q1-o1', text: 'Muito bem', value: 'very_well', order: 1 },
            { id: 'q1-o2', text: 'Bem', value: 'well', order: 2 },
            { id: 'q1-o3', text: 'Normal', value: 'normal', order: 3 },
            { id: 'q1-o4', text: 'Mal', value: 'bad', order: 4 },
            { id: 'q1-o5', text: 'Muito mal', value: 'very_bad', order: 5 }
          ]
        },
        {
          id: 'q2',
          text: 'Quais desses sintomas você tem experimentado? (Selecione todos que se aplicam)',
          type: QuestionType.CHECKBOX,
          required: true,
          order: 2,
          options: [
            { id: 'q2-o1', text: 'Ansiedade', value: 'anxiety', order: 1 },
            { id: 'q2-o2', text: 'Depressão', value: 'depression', order: 2 },
            { id: 'q2-o3', text: 'Insônia', value: 'insomnia', order: 3 },
            { id: 'q2-o4', text: 'Falta de concentração', value: 'concentration', order: 4 },
            { id: 'q2-o5', text: 'Estresse', value: 'stress', order: 5 },
            { id: 'q2-o6', text: 'Nenhum desses', value: 'none', order: 6 }
          ]
        },
        {
          id: 'q3',
          text: 'Por quanto tempo você tem sentido esses sintomas?',
          type: QuestionType.MULTIPLE_CHOICE,
          required: false,
          order: 3,
          options: [
            { id: 'q3-o1', text: 'Menos de 1 mês', value: 'less_1_month', order: 1 },
            { id: 'q3-o2', text: 'De 1 a 3 meses', value: '1_to_3_months', order: 2 },
            { id: 'q3-o3', text: 'De 4 a 6 meses', value: '4_to_6_months', order: 3 },
            { id: 'q3-o4', text: 'Aproximadamente 1 ano', value: 'about_1_year', order: 4 },
            { id: 'q3-o5', text: 'Mais de 1 ano', value: 'more_1_year', order: 5 }
          ]
        },
        {
          id: 'q4',
          text: 'Em uma escala de 1 a 5, qual é o impacto desses sintomas na sua vida diária?',
          type: QuestionType.SCALE,
          required: true,
          order: 4,
          options: [
            { id: 'q4-o1', text: 'Muito baixo', value: '1', order: 1 },
            { id: 'q4-o2', text: 'Baixo', value: '2', order: 2 },
            { id: 'q4-o3', text: 'Médio', value: '3', order: 3 },
            { id: 'q4-o4', text: 'Alto', value: '4', order: 4 },
            { id: 'q4-o5', text: 'Muito alto', value: '5', order: 5 }
          ]
        },
        {
          id: 'q5',
          text: 'Você já procurou ajuda profissional antes?',
          type: QuestionType.MULTIPLE_CHOICE,
          required: true,
          order: 5,
          options: [
            { id: 'q5-o1', text: 'Sim, estou em acompanhamento', value: 'yes_current', order: 1 },
            { id: 'q5-o2', text: 'Sim, no passado', value: 'yes_past', order: 2 },
            { id: 'q5-o3', text: 'Não', value: 'no', order: 3 }
          ]
        }
      ]
    };

    // Set mock data
    this.questionnaire$.next(mockQuestionnaire);
    this.questionnaire = mockQuestionnaire;
    this.initializeForm(mockQuestionnaire);
    this.cdr.markForCheck();
  }

  private initializeForm(questionnaire: Questionnaire): void {
    const formControls: any = {};
    questionnaire.questions.forEach(question => {
      formControls[question.id] = ['', question.required ? Validators.required : []];
    });
    // Add free text description to the main form
    formControls['freeTextDescription'] = ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]];
    this.questionnaireForm = this.fb.group(formControls);
    // Sync freeTextForm to reference the same control
    this.freeTextForm = this.questionnaireForm;
  }

  private initializeFreeTextForm(): void {
    // This method is no longer needed - form is initialized with questionnaire
  }

  getProgress(): number {
    const questionnaire = this.questionnaire$.value;
    if (!questionnaire) return 0;
    const total = questionnaire.questions.length;
    const answered = Object.values(this.questionnaireForm.value).filter(v => v).length;
    return (answered / total) * 33;
  }

  onCheckboxChange(event: any, questionId: string): void {
    const checkbox = event.target as HTMLInputElement;
    const currentValue = this.questionnaireForm.get(questionId)?.value || [];
    if (!Array.isArray(currentValue)) {
      this.questionnaireForm.get(questionId)?.setValue([checkbox.value]);
    } else if (checkbox.checked) {
      this.questionnaireForm.get(questionId)?.setValue([...currentValue, checkbox.value]);
    } else {
      this.questionnaireForm.get(questionId)?.setValue(currentValue.filter(v => v !== checkbox.value));
    }
  }

  goToFreeText(): void {
    if (this.questionnaireForm.valid) {
      this.currentStep$.next('free-text');
      this.currentStep = 'free-text';
      this.cdr.markForCheck();
    }
  }

  goToQuestionnaire(): void {
    this.currentStep$.next('questionnaire');
    this.currentStep = 'questionnaire';
    this.cdr.markForCheck();
  }

  goToProfessionals(): void {
    const response = this.recommendedProfessionals$.value;
    if (response) {
      this.router.navigate(['/professionals'], {
        queryParams: { 
          specialties: response.recommendedSpecialties.join(','),
          description: this.freeTextForm.get('freeTextDescription')?.value
        },
        state: {
          recommendedProfessionals: response.recommendedProfessionals
        }
      });
    }
  }

  onDescriptionChange(): void {
    const value = this.freeTextForm.get('freeTextDescription')?.value || '';
    this.characterCount = value.length;
  }

  onSubmitFreeText(): void {
    if (this.freeTextForm.valid && !this.isAnalyzing) {
      this.isAnalyzing = true;
      this.isAnalyzing$.next(true);
      this.cdr.markForCheck();
      const description = this.freeTextForm.get('freeTextDescription')?.value;
      
      const request = {
        patientDescription: description,
        previousContext: JSON.stringify(this.questionnaireForm.value)
      };

      this.aiAnalysisService.analyzeAndRecommend(request)
        .pipe(
          finalize(() => {
            this.isAnalyzing = false;
            this.isAnalyzing$.next(false);
            this.cdr.markForCheck();
          }),
          catchError(error => {
            console.error('Error analyzing with AI:', error);
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.recommendedProfessionals$.next(response);
            this.recommendedProfessionals = response;
            
            // Armazenar dados na sessão para uso posterior (ex: envio de WhatsApp)
            const description = this.freeTextForm.get('freeTextDescription')?.value;
            this.questionnaireSessionService.setSessionData({
              patientDescription: description,
              aiAnalysisResult: response,
              questionnaireResponses: this.questionnaireForm.value,
              timestamp: new Date()
            });
            
            this.currentStep$.next('results');
            this.currentStep = 'results';
            this.cdr.markForCheck();
          }
        });
    }
  }

  viewProfessional(professionalId: string): void {
    this.router.navigate(['/professional', professionalId]);
  }

  scheduleProfessional(professionalId: string): void {
    const sessionData = this.questionnaireSessionService.getSessionData();
    this.whatsAppService.openConsultationChat(sessionData);
  }

  getUrgencyColor(urgency: string): string {
    return this.aiAnalysisService.getUrgencyLevelColor(urgency);
  }

  translateUrgency(urgency: string): string {
    return this.aiAnalysisService.translateUrgencyLevel(urgency);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#ff6b6b';
    return '#dc3545';
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }
}
