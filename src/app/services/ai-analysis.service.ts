import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AIAnalysisRequest {
  patientDescription: string;
  previousContext?: string;
}

export interface AIAnalysisResponse {
  synthesis: string;
  identifiedIssues: string[];
  recommendedSpecialties: string[];
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  generalRecommendations?: string;
}

export interface RecommendedProfessional {
  id: string;
  name: string;
  specialties: string;
  bio?: string;
  location: string;
  consultationRate: number;
  averageRating: number;
  totalPatients: number;
  availableForNewPatients: boolean;
  profilePhotoUrl?: string;
  compatibilityScore: number;
  recommendationReason?: string;
}

export interface RecommendedProfessionalsResponse {
  problemSynthesis: string;
  identifiedIssues: string[];
  recommendedSpecialties: string[];
  urgencyLevel: string;
  recommendedProfessionals: RecommendedProfessional[];
  totalAvailable: number;
  generalRecommendations?: string;
}

export interface SearchProfessionalsByAIRequest {
  aiAnalysis: AIAnalysisResponse;
  page?: number;
  pageSize?: number;
  onlyAvailable?: boolean;
  city?: string;
  state?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIAnalysisService {
  private apiUrl = `${environment.apiUrl}/questionnaires`;

  constructor(private http: HttpClient) {}

  /**
   * Analisar descrição do paciente com IA e retornar profissionais recomendados
   */
  analyzeAndRecommend(request: AIAnalysisRequest): Observable<RecommendedProfessionalsResponse> {
    return this.http.post<RecommendedProfessionalsResponse>(
      `${this.apiUrl}/analyze-and-recommend`,
      request
    );
  }

  /**
   * Buscar profissionais especializados por análise pré-realizada
   */
  findProfessionals(request: SearchProfessionalsByAIRequest): Observable<RecommendedProfessionalsResponse> {
    return this.http.post<RecommendedProfessionalsResponse>(
      `${this.apiUrl}/find-professionals`,
      request
    );
  }

  /**
   * Analisar questionário respondido e retornar profissionais recomendados
   */
  analyzeQuestionnaireWithRecommendations(questionnaireId: string): Observable<RecommendedProfessionalsResponse> {
    return this.http.post<RecommendedProfessionalsResponse>(
      `${this.apiUrl}/${questionnaireId}/analyze-with-recommendations`,
      {}
    );
  }

  /**
   * Calcular score de compatibilidade (para uso local)
   */
  getUrgencyLevelColor(urgencyLevel: string): string {
    switch (urgencyLevel.toLowerCase()) {
      case 'critical':
        return '#dc3545';
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  /**
   * Traduzir nível de urgência
   */
  translateUrgencyLevel(level: string): string {
    const translations: { [key: string]: string } = {
      'critical': 'Crítico',
      'high': 'Alto',
      'medium': 'Médio',
      'low': 'Baixo'
    };
    return translations[level.toLowerCase()] || level;
  }
}
