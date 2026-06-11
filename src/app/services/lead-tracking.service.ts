import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface CreateLeadRequest {
  questionnaireId?: string;
  patientId?: string;
  professionalId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerUrl?: string;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadTrackingService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  createLead(request: CreateLeadRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, request);
  }
}
