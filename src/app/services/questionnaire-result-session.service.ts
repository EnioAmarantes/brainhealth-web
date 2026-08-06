import { Injectable } from '@angular/core';
import { RecommendedProfessionalsResponse } from '@app/models/questionnaire.model';

interface QuestionnaireResultSession {
  recommendation: RecommendedProfessionalsResponse;
  patientDescription: string;
  patientName: string;
  questionnaireType: string;
  questionnaireScore: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireResultSessionService {
  private static readonly StorageKey = 'brainhealth.questionnaire.result.session';

  save(data: QuestionnaireResultSession): void {
    localStorage.setItem(QuestionnaireResultSessionService.StorageKey, JSON.stringify(data));
  }

  load(): QuestionnaireResultSession | null {
    const raw = localStorage.getItem(QuestionnaireResultSessionService.StorageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as QuestionnaireResultSession;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(QuestionnaireResultSessionService.StorageKey);
  }
}
