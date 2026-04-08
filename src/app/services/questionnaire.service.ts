import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Questionnaire, 
  QuestionnaireResponse, 
  ScreeningResult 
} from '@app/models/questionnaire.model';
import { environment } from '@environments/environment';

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
   * Envia respostas do questionário e obtém resultado
   */
  submitQuestionnaire(response: QuestionnaireResponse): Observable<ScreeningResult> {
    return this.http.post<ScreeningResult>(
      `${this.apiUrl}/submit`,
      response
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
