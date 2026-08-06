import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RecommendedProfessional, RecommendedProfessionalsResponse } from '@app/models/questionnaire.model';
import { QuestionnaireResultSessionService } from '@app/services/questionnaire-result-session.service';
import { WhatsAppService } from '@app/services/whatsapp.service';

@Component({
  selector: 'app-questionnaire-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questionnaire-result.component.html',
  styleUrl: './questionnaire-result.component.scss'
})
export class QuestionnaireResultComponent implements OnInit {
  readonly recommendation = signal<RecommendedProfessionalsResponse | null>(null);
  readonly patientDescription = signal<string>('');
  readonly patientName = signal<string>('Paciente');
  readonly questionnaireType = signal<string>('');
  readonly questionnaireScore = signal<number | null>(null);
  readonly contactErrorMessage = signal<string>('');

  constructor(
    private readonly sessionService: QuestionnaireResultSessionService,
    private readonly whatsAppService: WhatsAppService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const data = this.sessionService.load();

    if (!data) {
      void this.router.navigate(['/questionnaire']);
      return;
    }

    this.recommendation.set(data.recommendation);
    this.patientDescription.set(data.patientDescription);
    this.patientName.set(data.patientName || 'Paciente');
    this.questionnaireType.set(data.questionnaireType);
    this.questionnaireScore.set(data.questionnaireScore);
  }

  navigateBack(): void {
    void this.router.navigate(['/questionnaire']);
  }

  startWhatsAppContact(professional: RecommendedProfessional): void {
    const recommendation = this.recommendation();

    if (!recommendation) {
      this.contactErrorMessage.set('Nao foi possivel carregar os dados da recomendacao.');
      return;
    }

    const link = this.whatsAppService.generateWhatsAppLink({
      professionalName: professional.name,
      patientDescription: this.patientDescription(),
      aiAnalysisSynthesis: recommendation.problemSynthesis,
      identifiedIssues: recommendation.identifiedIssues,
      recommendedSpecialties: recommendation.recommendedSpecialties,
      urgencyLevel: recommendation.urgencyLevel,
      patientName: this.patientName()
    });

    this.whatsAppService.openWhatsAppChat(link);
  }
}
