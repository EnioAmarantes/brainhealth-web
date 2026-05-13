import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionNoteService {
  private apiUrl = `${environment.apiUrl}/sessionnotes`;

  constructor(private http: HttpClient) {}

  /**
   * Cria anotações de uma sessão
   */
  createSessionNote(request: CreateSessionNoteRequest): Observable<SessionNoteDto> {
    return this.http.post<SessionNoteDto>(this.apiUrl, request);
  }

  /**
   * Obtém anotações de uma sessão
   */
  getSessionNote(noteId: string): Observable<SessionNoteDto> {
    return this.http.get<SessionNoteDto>(`${this.apiUrl}/${noteId}`);
  }

  /**
   * Obtém anotações por agendamento
   */
  getSessionNoteByAppointment(appointmentId: string): Observable<SessionNoteDto> {
    return this.http.get<SessionNoteDto>(
      `${this.apiUrl}/by-appointment/${appointmentId}`
    );
  }

  /**
   * Obtém todas as anotações de um profissional
   */
  getProfessionalNotes(professionalId: string): Observable<SessionNoteDto[]> {
    return this.http.get<SessionNoteDto[]>(
      `${this.apiUrl}/professional/${professionalId}`
    );
  }

  /**
   * Atualiza anotações de uma sessão
   */
  updateSessionNote(
    noteId: string,
    request: UpdateSessionNoteRequest
  ): Observable<SessionNoteDto> {
    return this.http.put<SessionNoteDto>(
      `${this.apiUrl}/${noteId}`,
      request
    );
  }

  /**
   * Deleta anotações de uma sessão
   */
  deleteSessionNote(noteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${noteId}`);
  }
}

// ==================== DTOs ====================

export interface SessionNoteDto {
  id: string;
  appointmentId: string;
  content?: string;
  sessionRating?: number;
  patientMoodObservations?: string;
  topicsCovered?: string;
  progressNotes?: string;
  recommendations?: string;
  homework?: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionNoteRequest {
  appointmentId: string;
  content?: string;
  sessionRating?: number;
  patientMoodObservations?: string;
  topicsCovered?: string;
  progressNotes?: string;
  recommendations?: string;
  homework?: string;
  tags?: string;
}

export interface UpdateSessionNoteRequest {
  content?: string;
  sessionRating?: number;
  patientMoodObservations?: string;
  topicsCovered?: string;
  progressNotes?: string;
  recommendations?: string;
  homework?: string;
  tags?: string;
}
