import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AIAnalysisRequest,
  RecommendedProfessionalsResponse
} from '@app/models/questionnaire.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private readonly apiUrl = `${environment.apiUrl}/Questionnaires`;

  constructor(private readonly http: HttpClient) {}

  analyzeAndRecommend(request: AIAnalysisRequest): Observable<RecommendedProfessionalsResponse> {
    return this.http.post<RecommendedProfessionalsResponse>(`${this.apiUrl}/analyze-and-recommend`, request);
  }
}
