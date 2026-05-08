import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorMessage {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
  code?: string;
}

/**
 * Centraliza tratamento de erros da aplicação
 * Permite componentes reagirem a erros de forma consistente
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new Subject<ErrorMessage>();
  public error$ = this.errorSubject.asObservable();

  constructor() {}

  /**
   * Mostra erro customizado
   */
  showError(message: string, code?: string): void {
    this.errorSubject.next({
      message,
      type: 'error',
      timestamp: Date.now(),
      code
    });
  }

  /**
   * Mostra warning
   */
  showWarning(message: string): void {
    this.errorSubject.next({
      message,
      type: 'warning',
      timestamp: Date.now()
    });
  }

  /**
   * Mostra info
   */
  showInfo(message: string): void {
    this.errorSubject.next({
      message,
      type: 'info',
      timestamp: Date.now()
    });
  }

  /**
   * Trata erro HTTP automaticamente
   */
  handleHttpError(error: HttpErrorResponse): void {
    let message = 'Erro ao conectar com servidor';

    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 400) {
      message = 'Dados inválidos';
    } else if (error.status === 401) {
      message = 'Não autorizado';
    } else if (error.status === 403) {
      message = 'Acesso negado';
    } else if (error.status === 404) {
      message = 'Recurso não encontrado';
    } else if (error.status === 500) {
      message = 'Erro interno do servidor';
    }

    this.showError(message, `HTTP_${error.status}`);
  }
}
