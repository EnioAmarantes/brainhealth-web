import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RecommendedProfessionalsResponse } from './ai-analysis.service';

export interface QuestionnaireSessionData {
  patientDescription: string;
  aiAnalysisResult: RecommendedProfessionalsResponse;
  questionnaireResponses: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireSessionService {
  private sessionDataSubject = new BehaviorSubject<QuestionnaireSessionData | null>(null);
  public sessionData$ = this.sessionDataSubject.asObservable();

  constructor() {
    // Tentar recuperar dados armazenados em sessionStorage
    this.loadFromStorage();
  }

  /**
   * Armazena os dados da sessão do questionário
   */
  setSessionData(data: QuestionnaireSessionData): void {
    this.sessionDataSubject.next(data);
    this.saveToStorage(data);
  }

  /**
   * Obtém os dados atuais da sessão
   */
  getSessionData(): QuestionnaireSessionData | null {
    return this.sessionDataSubject.value;
  }

  /**
   * Obtém descrição do paciente
   */
  getPatientDescription(): string | null {
    const data = this.sessionDataSubject.value;
    return data?.patientDescription || null;
  }

  /**
   * Obtém resultado da análise de IA
   */
  getAIAnalysisResult(): RecommendedProfessionalsResponse | null {
    const data = this.sessionDataSubject.value;
    return data?.aiAnalysisResult || null;
  }

  /**
   * Obtém respostas do questionário
   */
  getQuestionnaireResponses(): any {
    const data = this.sessionDataSubject.value;
    return data?.questionnaireResponses || null;
  }

  /**
   * Limpa os dados da sessão
   */
  clearSessionData(): void {
    this.sessionDataSubject.next(null);
    sessionStorage.removeItem('questionnaire_session_data');
  }

  /**
   * Salva dados em sessionStorage para persistência entre navegações
   */
  private saveToStorage(data: QuestionnaireSessionData): void {
    try {
      const serialized = JSON.stringify({
        ...data,
        timestamp: data.timestamp.toISOString()
      });
      sessionStorage.setItem('questionnaire_session_data', serialized);
    } catch (error) {
      console.error('Erro ao salvar dados em sessionStorage:', error);
    }
  }

  /**
   * Carrega dados do sessionStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('questionnaire_session_data');
      if (stored) {
        const data = JSON.parse(stored);
        data.timestamp = new Date(data.timestamp);
        this.sessionDataSubject.next(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de sessionStorage:', error);
    }
  }
}
