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
  clientContextJson?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadTrackingService {
  private apiUrl = `${environment.apiUrl}/leads`;
  private readonly sessionStorageKey = 'bh_anon_session_id';

  constructor(private http: HttpClient) {}

  createLead(request: CreateLeadRequest): Observable<unknown> {
    const enrichedRequest: CreateLeadRequest = {
      ...request,
      referrerUrl: request.referrerUrl || document.referrer || undefined,
      userAgent: request.userAgent || navigator.userAgent,
      clientContextJson: request.clientContextJson || JSON.stringify(this.collectClientContext())
    };

    return this.http.post(this.apiUrl, enrichedRequest);
  }

  private collectClientContext(): Record<string, unknown> {
    const nav = navigator;
    const ua = nav.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);

    return {
      sessionId: this.getOrCreateSessionId(),
      pageUrl: window.location.href,
      path: window.location.pathname,
      language: nav.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: nav.platform,
      isMobile,
      deviceType: isMobile ? 'mobile' : 'desktop',
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      touchPoints: nav.maxTouchPoints || 0,
      capturedAtUtc: new Date().toISOString()
    };
  }

  private getOrCreateSessionId(): string {
    const existing = sessionStorage.getItem(this.sessionStorageKey);
    if (existing) {
      return existing;
    }

    const randomPart = Math.random().toString(36).slice(2, 10);
    const sessionId = `anon-${Date.now()}-${randomPart}`;
    sessionStorage.setItem(this.sessionStorageKey, sessionId);
    return sessionId;
  }
}
