import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuestionnaireTemplate,
  QuestionnaireAnswerResponse,
  SubmitQuestionnaireAnswerRequest
} from '@app/models/questionnaire.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  private readonly apiUrl = `${environment.apiUrl}/Questionnaires`;

  constructor(private readonly http: HttpClient) {}

  getAvailableTemplates(): Observable<QuestionnaireTemplate[]> {
    return this.http.get<QuestionnaireTemplate[]>(`${this.apiUrl}/templates`);
  }

  getTemplateByType(type: string): Observable<QuestionnaireTemplate> {
    return this.http.get<QuestionnaireTemplate>(`${this.apiUrl}/templates/${encodeURIComponent(type)}`);
  }

  submitAnswers(request: SubmitQuestionnaireAnswerRequest): Observable<QuestionnaireAnswerResponse> {
    return this.http.post<QuestionnaireAnswerResponse>(`${this.apiUrl}/submit`, request);
  }
}
