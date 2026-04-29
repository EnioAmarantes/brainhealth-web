import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, PrimaryButtonComponent, SecondaryButtonComponent } from '@app/components/shared';
import { RecommendedProfessionalsResponse, RecommendedProfessional, AIAnalysisService } from '@app/services/ai-analysis.service';
import { WhatsAppService } from '@app/services/whatsapp.service';
import { QuestionnaireSessionService } from '@app/services/questionnaire-session.service';

@Component({
  selector: 'app-recommended-professionals',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="recommended-professionals-container">
      <!-- Problem Summary -->
      <app-card [elevated]="true" class="summary-card">
        <div class="summary-header">
          <h2>Análise de Saúde Mental</h2>
          <div class="urgency-badge" [style.backgroundColor]="getUrgencyColor(response.urgencyLevel)">
            {{ aiAnalysisService.translateUrgencyLevel(response.urgencyLevel) }}
          </div>
        </div>

        <div class="problem-synthesis">
          <h3>Síntese do Problema</h3>
          <p>{{ response.problemSynthesis }}</p>
        </div>

        <div class="issues-section">
          <h3>Problemas Identificados</h3>
          <div class="issues-list">
            <span *ngFor="let issue of response.identifiedIssues" class="issue-tag">
              {{ issue }}
            </span>
          </div>
        </div>

        <div class="specialties-section">
          <h3>Especialidades Recomendadas</h3>
          <div class="specialties-list">
            <span *ngFor="let specialty of response.recommendedSpecialties" class="specialty-tag">
              {{ specialty }}
            </span>
          </div>
        </div>

        <div *ngIf="response.generalRecommendations" class="recommendations-section">
          <h3>Recomendações Gerais</h3>
          <p>{{ response.generalRecommendations }}</p>
        </div>
      </app-card>

      <!-- Professionals List -->
      <div class="professionals-section">
        <h2>Profissionais Recomendados</h2>
        <p class="total-available">Total de {{ response.totalAvailable }} profissional(is) disponível(is)</p>

        <div *ngIf="response.recommendedProfessionals.length === 0" class="no-professionals">
          <p>Nenhum profissional disponível no momento que atenda aos critérios especificados.</p>
        </div>

        <div class="professionals-grid">
          <app-card *ngFor="let professional of response.recommendedProfessionals" class="professional-card">
            <div class="professional-header">
              <div class="professional-info">
                <h3>{{ professional.name }}</h3>
                <p class="location">📍 {{ professional.location }}</p>
              </div>
              <div class="compatibility-score">
                <div class="score-circle" [style.backgroundColor]="getScoreColor(professional.compatibilityScore)">
                  {{ professional.compatibilityScore }}%
                </div>
                <p class="score-label">Compatibilidade</p>
              </div>
            </div>

            <div class="professional-details">
              <div class="specialty">
                <strong>Especialidade:</strong>
                <span>{{ professional.specialties }}</span>
              </div>

              <div *ngIf="professional.bio" class="bio">
                <strong>Sobre:</strong>
                <p>{{ professional.bio }}</p>
              </div>

              <div class="rating">
                <strong>Avaliação:</strong>
                <div class="stars">
                  <span *ngFor="let star of [1,2,3,4,5]" class="star" [class.filled]="star <= professional.averageRating">
                    ★
                  </span>
                  <span class="rating-value">({{ professional.averageRating }}/5)</span>
                </div>
              </div>

              <div class="patients">
                <strong>Pacientes Atendidos:</strong>
                <span>{{ professional.totalPatients }}</span>
              </div>

              <div class="consultation-rate">
                <strong>Valor da Consulta:</strong>
                <span class="rate">R$ {{ professional.consultationPrice | number: '1.2-2' }}</span>
              </div>

              <div *ngIf="professional.recommendationReason" class="reason">
                <strong>Por que essa recomendação:</strong>
                <p>{{ professional.recommendationReason }}</p>
              </div>

              <div class="status" [class.available]="professional.availableForNewPatients">
                <span *ngIf="professional.availableForNewPatients" class="badge-success">
                  ✓ Aceitando Novos Pacientes
                </span>
                <span *ngIf="!professional.availableForNewPatients" class="badge-warning">
                  ⚠ Não está aceitando novos pacientes
                </span>
              </div>
            </div>

            <div class="professional-actions">
              <app-primary-button
                label="Ver Perfil"
                (onClick)="viewProfile(professional.id)"
              ></app-primary-button>
              <button 
                class="whatsapp-button"
                (click)="scheduleConsultation(professional.id)"
                [disabled]="!professional.availableForNewPatients"
                title="Enviar mensagem via WhatsApp"
              >
                <span class="whatsapp-icon">💚</span>
                <span class="whatsapp-text">WhatsApp</span>
              </button>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recommended-professionals-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .summary-card {
      margin-bottom: 2rem;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .summary-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .urgency-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .problem-synthesis,
    .issues-section,
    .specialties-section,
    .recommendations-section {
      margin-bottom: 1.5rem;
    }

    .problem-synthesis h3,
    .issues-section h3,
    .specialties-section h3,
    .recommendations-section h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #333;
    }

    .problem-synthesis p {
      margin: 0;
      line-height: 1.6;
      color: #555;
    }

    .issues-list,
    .specialties-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .issue-tag,
    .specialty-tag {
      background: #e8f4f8;
      color: #0066cc;
      padding: 0.4rem 0.8rem;
      border-radius: 15px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .specialty-tag {
      background: #f0e8f8;
      color: #660066;
    }

    .recommendations-section p {
      margin: 0;
      line-height: 1.6;
      color: #555;
    }

    .professionals-section {
      margin-top: 2rem;
    }

    .professionals-section h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .total-available {
      margin: 0 0 1.5rem 0;
      color: #666;
      font-size: 0.95rem;
    }

    .no-professionals {
      text-align: center;
      padding: 2rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .professionals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .professional-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .professional-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .professional-info h3 {
      margin: 0 0 0.3rem 0;
      font-size: 1.1rem;
    }

    .location {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .compatibility-score {
      text-align: center;
    }

    .score-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.9rem;
      margin-bottom: 0.3rem;
    }

    .score-label {
      margin: 0;
      font-size: 0.75rem;
      color: #666;
    }

    .professional-details {
      flex: 1;
    }

    .specialty,
    .bio,
    .rating,
    .patients,
    .consultation-rate,
    .reason,
    .status {
      margin-bottom: 0.8rem;
      font-size: 0.9rem;
    }

    .specialty strong,
    .bio strong,
    .rating strong,
    .patients strong,
    .consultation-rate strong,
    .reason strong,
    .status strong {
      display: block;
      margin-bottom: 0.2rem;
      color: #333;
    }

    .specialty span,
    .patients span,
    .consultation-rate span {
      color: #555;
    }

    .bio p {
      margin: 0;
      line-height: 1.5;
      color: #555;
    }

    .stars {
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .star {
      color: #ddd;
      font-size: 1rem;
    }

    .star.filled {
      color: #ffc107;
    }

    .rating-value {
      margin-left: 0.3rem;
      color: #666;
      font-size: 0.85rem;
    }

    .rate {
      font-weight: bold;
      color: #28a745;
      font-size: 1rem;
    }

    .reason p {
      margin: 0;
      line-height: 1.5;
      color: #555;
    }

    .badge-success,
    .badge-warning {
      display: inline-block;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: bold;
    }

    .badge-success {
      background: #d4edda;
      color: #155724;
    }

    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }

    .professional-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .professional-actions app-primary-button {
      flex: 1;
    }

    .professional-actions app-secondary-button {
      flex: 1;
    }

    .whatsapp-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex: 1;
      padding: 12px 16px;
      background: linear-gradient(135deg, #25d366 0%, #20ba58 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3);
      font-family: inherit;
    }

    .whatsapp-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #22c959 0%, #1fa556 100%);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      transform: translateY(-2px);
    }

    .whatsapp-button:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3);
    }

    .whatsapp-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .whatsapp-icon {
      font-size: 18px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .whatsapp-text {
      font-size: 14px;
    }
  `]
})
export class RecommendedProfessionalsComponent {
  @Input() response!: RecommendedProfessionalsResponse;
  @Output() viewProfileClick = new EventEmitter<string>();
  @Output() scheduleConsultationClick = new EventEmitter<string>();

  constructor(
    protected aiAnalysisService: AIAnalysisService,
    private whatsAppService: WhatsAppService,
    private questionnaireSessionService: QuestionnaireSessionService
  ) {}

  getUrgencyColor(level: string): string {
    return this.aiAnalysisService.getUrgencyLevelColor(level);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#ff6b6b';
    return '#dc3545';
  }

  viewProfile(professionalId: string): void {
    this.viewProfileClick.emit(professionalId);
  }

  scheduleConsultation(professionalId: string): void {
    this.scheduleConsultationClick.emit(professionalId);
  }
}
