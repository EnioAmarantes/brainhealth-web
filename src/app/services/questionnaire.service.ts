import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Questionnaire } from '@app/models/questionnaire.model';
import { environment } from '@environments/environment';

export interface SubmitQuestionnaireAnswerRequest {
  type: string;
  answers: string;
  symptomsDuration?: string;
  freeTextDescription?: string;
}

export interface QuestionnaireAnswerResponse {
  id: string;
  type: string;
  title: string;
  questions?: string;
  answers?: string;
  totalScore?: number;
  result?: string;
  recommendations?: string;
  freeTextDescription?: string;
  symptomsDuration?: string;
  aiSynthesis?: string;
  identifiedIssues?: string;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  private apiUrl = `${environment.apiUrl}/questionnaires`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém questionário de triagem
   */
  getScreeningQuestionnaire(): Observable<Questionnaire> {
    return this.http.get<Questionnaire>(`${this.apiUrl}/screening`);
  }

  /**
   * Envia respostas do questionário de triagem para persistência no backend
   */
  submitAnswers(request: SubmitQuestionnaireAnswerRequest): Observable<QuestionnaireAnswerResponse> {
    return this.http.post<QuestionnaireAnswerResponse>(
      `${this.apiUrl}/answer`,
      request
    );
  }

  /**
   * Envia respostas do questionário anonimamente (sem autenticação)
   */
  submitAnswersAnonymously(request: SubmitQuestionnaireAnswerRequest): Observable<QuestionnaireAnswerResponse> {
    return this.http.post<QuestionnaireAnswerResponse>(
      `${this.apiUrl}/answer-anonymous`,
      request
    );
  }

  /**
   * Obtém todos os questionários disponíveis
   */
  getQuestionnaires(): Observable<Questionnaire[]> {
    return this.http.get<Questionnaire[]>(this.apiUrl);
  }

  /**
   * Obtém questionário por ID
   */
  getQuestionnaireById(id: string): Observable<Questionnaire> {
    return this.http.get<Questionnaire>(`${this.apiUrl}/${id}`);
  }
}
