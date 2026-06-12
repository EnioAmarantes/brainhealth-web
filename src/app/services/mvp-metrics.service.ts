import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface OfferMetrics {
  professionalsRegistered: number;
  professionalsActive: number;
}

export interface DemandMetrics {
  triagesCompleted: number;
  triagesCompletedLastNDays: number;
}

export interface ConversionMetrics {
  professionalClicks: number;
  leadsGenerated: number;
  professionalClicksLastNDays: number;
  leadsGeneratedLastNDays: number;
  clickRatePercent: number;
}

export interface MvpValidationMetrics {
  generatedAtUtc: string;
  windowDays: number;
  offer: OfferMetrics;
  demand: DemandMetrics;
  conversion: ConversionMetrics;
}

@Injectable({
  providedIn: 'root'
})
export class MvpMetricsService {
  private apiUrl = `${environment.apiUrl}/metrics`;

  constructor(private http: HttpClient) {}

  getMvpMetrics(days = 7): Observable<MvpValidationMetrics> {
    const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7;
    const params = new HttpParams().set('days', safeDays.toString());

    return this.http.get<MvpValidationMetrics>(`${this.apiUrl}/mvp`, { params });
  }
}
