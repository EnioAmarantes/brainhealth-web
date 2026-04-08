import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  public loading$ = this.loadingSubject.asObservable();

  private requestCount = 0;

  constructor() {}

  /**
   * Inicia loading
   */
  show(message?: string): void {
    this.requestCount++;
    this.loadingSubject.next({ isLoading: true, message });
  }

  /**
   * Para loading
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next({ isLoading: false });
    }
  }

  /**
   * Limpa loading
   */
  clear(): void {
    this.requestCount = 0;
    this.loadingSubject.next({ isLoading: false });
  }

  /**
   * Obtém estado atual de loading
   */
  isLoading(): Observable<LoadingState> {
    return this.loading$;
  }
}
