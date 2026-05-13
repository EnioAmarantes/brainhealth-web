import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionReportService {
  private apiUrl = `${environment.apiUrl}/sessionreports`;

  constructor(private http: HttpClient) {}

  /**
   * Gera um relatório de sessão
   */
  generateSessionReport(request: GenerateSessionReportRequest): Observable<SessionReportDto> {
    return this.http.post<SessionReportDto>(this.apiUrl, request);
  }

  /**
   * Obtém um relatório de sessão
   */
  getSessionReport(reportId: string): Observable<SessionReportDto> {
    return this.http.get<SessionReportDto>(`${this.apiUrl}/${reportId}`);
  }

  /**
   * Obtém relatório por agendamento
   */
  getReportByAppointment(appointmentId: string): Observable<SessionReportDto> {
    return this.http.get<SessionReportDto>(
      `${this.apiUrl}/by-appointment/${appointmentId}`
    );
  }

  /**
   * Obtém todos os relatórios de um profissional
   */
  getProfessionalReports(
    professionalId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<SessionReportDto[]> {
    let url = `${this.apiUrl}/professional/${professionalId}`;
    const params: Record<string, string> = {};

    if (startDate) params['startDate'] = startDate.toISOString();
    if (endDate) params['endDate'] = endDate.toISOString();

    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    return this.http.get<SessionReportDto[]>(url);
  }

  /**
   * Compartilha um relatório com o paciente
   */
  shareReportWithPatient(reportId: string): Observable<SessionReportDto> {
    return this.http.put<SessionReportDto>(
      `${this.apiUrl}/${reportId}/share`,
      {}
    );
  }

  /**
   * Obtém relatórios compartilhados com um paciente
   */
  getPatientSharedReports(patientId: string): Observable<SessionReportDto[]> {
    return this.http.get<SessionReportDto[]>(
      `${this.apiUrl}/patient/${patientId}/shared`
    );
  }

  /**
   * Deleta um relatório
   */
  deleteSessionReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`);
  }
}

// ==================== DTOs ====================

export interface SessionReportDto {
  id: string;
  appointmentId: string;
  sessionNoteId?: string;
  summary?: string;
  fullReport?: string;
  overallRating: number;
  generatedAt: Date;
  updatedAt: Date;
  sharedWithPatient: boolean;
  sharedAt?: Date;
}

export interface GenerateSessionReportRequest {
  appointmentId: string;
  summary?: string;
  overallRating: number;
}
