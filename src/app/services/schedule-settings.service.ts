import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleSettingsService {
  private apiUrl = `${environment.apiUrl}/schedulesettings`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém as configurações de agenda de um profissional
   */
  getSettings(professionalId: string): Observable<ProfessionalScheduleSettingsDto> {
    return this.http.get<ProfessionalScheduleSettingsDto>(
      `${this.apiUrl}/${professionalId}`
    );
  }

  /**
   * Atualiza as configurações de agenda
   */
  updateSettings(
    professionalId: string,
    request: UpdateScheduleSettingsRequest
  ): Observable<ProfessionalScheduleSettingsDto> {
    return this.http.put<ProfessionalScheduleSettingsDto>(
      `${this.apiUrl}/${professionalId}`,
      request
    );
  }

  /**
   * Obtém horários disponíveis para um dia específico
   */
  getAvailableSlots(
    professionalId: string,
    date: Date
  ): Observable<TimeSlot[]> {
    const params = new HttpParams().set('date', date.toISOString());

    return this.http.get<TimeSlot[]>(
      `${this.apiUrl}/${professionalId}/available-slots`,
      { params }
    );
  }

  /**
   * Obtém horários disponíveis para uma semana
   */
  getWeeklyAvailableSlots(
    professionalId: string,
    weekStartDate: Date
  ): Observable<Record<string, TimeSlot[]>> {
    const params = new HttpParams().set(
      'weekStartDate',
      weekStartDate.toISOString()
    );

    return this.http.get<Record<string, TimeSlot[]>>(
      `${this.apiUrl}/${professionalId}/weekly-available-slots`,
      { params }
    );
  }
}

// ==================== DTOs ====================

export interface ProfessionalScheduleSettingsDto {
  id: string;
  professionalId: string;
  maxSessionsPerWeek: number;
  sessionDurationMinutes: number;
  cancellationDeadlineHours: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  workingDays: string; // "1,2,3,4,5"
  breakBetweenSessionsMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateScheduleSettingsRequest {
  maxSessionsPerWeek: number;
  sessionDurationMinutes: number;
  cancellationDeadlineHours: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  workingDays: string; // "1,2,3,4,5"
  breakBetweenSessionsMinutes: number;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}
