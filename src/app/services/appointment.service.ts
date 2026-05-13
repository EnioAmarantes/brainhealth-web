import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Cria um novo agendamento
   */
  createAppointment(
    professionalId: string,
    request: CreateAppointmentRequest
  ): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(
      `${this.apiUrl}?professionalId=${professionalId}`,
      request
    );
  }

  /**
   * Obtém um agendamento específico
   */
  getAppointment(appointmentId: string): Observable<AppointmentDetailDto> {
    return this.http.get<AppointmentDetailDto>(
      `${this.apiUrl}/${appointmentId}`
    );
  }

  /**
   * Obtém agendamentos de um profissional
   */
  getProfessionalAppointments(
    professionalId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<AppointmentDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<AppointmentDto[]>(
      `${this.apiUrl}/professional/${professionalId}`,
      { params }
    );
  }

  /**
   * Obtém agendamentos de um paciente
   */
  getPatientAppointments(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<AppointmentDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<AppointmentDto[]>(
      `${this.apiUrl}/patient/${patientId}`,
      { params }
    );
  }

  /**
   * Confirma um agendamento (paciente)
   */
  confirmAppointment(appointmentId: string): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(
      `${this.apiUrl}/${appointmentId}/confirm`,
      {}
    );
  }

  /**
   * Cancela um agendamento
   */
  cancelAppointment(
    appointmentId: string,
    request: CancelAppointmentRequest
  ): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(
      `${this.apiUrl}/${appointmentId}/cancel`,
      request
    );
  }

  /**
   * Marca agendamento como em andamento
   */
  startAppointment(appointmentId: string): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(
      `${this.apiUrl}/${appointmentId}/start`,
      {}
    );
  }

  /**
   * Marca agendamento como concluído
   */
  completeAppointment(appointmentId: string): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(
      `${this.apiUrl}/${appointmentId}/complete`,
      {}
    );
  }

  /**
   * Obtém agenda semanal de um profissional
   */
  getWeeklySchedule(
    professionalId: string,
    weekStartDate: Date
  ): Observable<Record<string, AppointmentDto[]>> {
    const params = new HttpParams().set(
      'weekStartDate',
      weekStartDate.toISOString()
    );

    return this.http.get<Record<string, AppointmentDto[]>>(
      `${this.apiUrl}/${professionalId}/weekly-schedule`,
      { params }
    );
  }

  /**
   * Obtém agenda mensal de um profissional
   */
  getMonthlySchedule(
    professionalId: string,
    year: number,
    month: number
  ): Observable<Record<number, AppointmentDto[]>> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<Record<number, AppointmentDto[]>>(
      `${this.apiUrl}/${professionalId}/monthly-schedule`,
      { params }
    );
  }

  /**
   * Verifica se um paciente pode cancelar o agendamento
   */
  canCancelAppointment(appointmentId: string): Observable<{ canCancel: boolean }> {
    return this.http.get<{ canCancel: boolean }>(
      `${this.apiUrl}/${appointmentId}/can-cancel`
    );
  }
}

// ==================== DTOs ====================

export interface AppointmentDto {
  id: string;
  professionalId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  startDateTime: Date;
  endDateTime: Date;
  status: string;
  description?: string;
  notes?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentDetailDto extends AppointmentDto {
  professionalName: string;
  professionalSpecialties: string;
  cancelledBy?: string;
  sessionReport?: SessionReportDto;
}

export interface CreateAppointmentRequest {
  patientId: string;
  startDateTime: Date;
  endDateTime: Date;
  description?: string;
}

export interface CancelAppointmentRequest {
  cancellationReason?: string;
}

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
