import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { 
  QuestionnaireFreeTextComponent 
} from '@app/components/questionnaire-free-text/questionnaire-free-text.component';
import { 
  RecommendedProfessionalsComponent 
} from '@app/components/recommended-professionals/recommended-professionals.component';
import {
  RecommendedProfessionalsResponse
} from '@app/services/ai-analysis.service';

@Component({
  selector: 'app-questionnaire-result',
  standalone: true,
  imports: [
    CommonModule,
    QuestionnaireFreeTextComponent,
    RecommendedProfessionalsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="questionnaire-result-container">
      <!-- Step 1: Free Text Description -->
      <div *ngIf="(recommendedProfessionals$ | async) === null" class="step-1">
        <app-questionnaire-free-text
          [isLoading]="(isLoading$ | async) || false"
          (descriptionSubmitted)="onDescriptionSubmitted($event)"
          (resultReady)="onResultReady($event)"
        ></app-questionnaire-free-text>
      </div>

      <!-- Step 2: Recommended Professionals -->
      <div *ngIf="recommendedProfessionals$ | async as response" class="step-2">
        <app-recommended-professionals
          [response]="response"
          (viewProfileClick)="onViewProfile($event)"
          (scheduleConsultationClick)="onScheduleConsultation($event)"
        ></app-recommended-professionals>

        <div class="action-buttons">
          <button (click)="goBack()" class="back-button">
            ← Voltar e Procurar Outros Profissionais
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .questionnaire-result-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .step-1,
    .step-2 {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      padding: 2rem;
      gap: 1rem;
    }

    .back-button {
      padding: 0.75rem 1.5rem;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.3s;
    }

    .back-button:hover {
      background: #e0e0e0;
      border-color: #999;
    }
  `]
})
export class QuestionnaireResultComponent implements OnInit {
  recommendedProfessionals$ = new BehaviorSubject<RecommendedProfessionalsResponse | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicializar componente
  }

  onDescriptionSubmitted(description: string): void {
    console.log('Descrição enviada:', description);
    // Aqui você pode salvar a descrição, se necessário
  }

  onResultReady(response: RecommendedProfessionalsResponse): void {
    console.log('Resultado pronto:', response);
    this.recommendedProfessionals$.next(response);
  }

  onViewProfile(professionalId: string): void {
    console.log('Ver perfil:', professionalId);
    this.router.navigate(['/professional', professionalId]);
  }

  onScheduleConsultation(professionalId: string): void {
    console.log('Agendar consulta:', professionalId);
    this.router.navigate(['/schedule'], { 
      queryParams: { professionalId } 
    });
  }

  goBack(): void {
    this.recommendedProfessionals$.next(null);
  }
}

/*
  EXEMPLO DE USO:

  No seu app.routes.ts, adicione:
  {
    path: 'questionnaire-result',
    component: QuestionnaireResultComponent
  }

  No seu questionnaire-screen.component.ts, após submeter o questionário:
  this.router.navigate(['/questionnaire-result']);

  ESTRUTURA:
  1. Usuário vê campo de texto livre
  2. Digita descrição do problema
  3. Clica "Analisar"
  4. IA analisa e retorna problemas/especialidades
  5. Backend busca profissionais compatíveis
  6. Frontend exibe lista de profissionais recomendados
  7. Usuário pode clicar para ver perfil ou agendar
*/
