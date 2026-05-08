import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

export interface FieldError {
  fieldName: string;
  message: string;
}

/**
 * Classe base para todos os forms do sistema
 * Reduz duplicação de código e standardiza validação
 */
@Component({
  template: '' // Abstract component
})
export abstract class BaseFormComponent implements OnInit, OnDestroy {
  // Propriedades públicas
  form!: FormGroup;
  isSubmitting$ = new BehaviorSubject<boolean>(false);
  formError$ = new BehaviorSubject<string | null>(null);
  fieldErrors: Map<string, string> = new Map();

  // Propriedade protegida
  protected destroy$ = new Subject<void>();

  constructor(
    protected fb: FormBuilder
  ) {}

  /**
   * Lifecycle Hook - Inicializar form
   */
  ngOnInit(): void {
    this.form = this.buildForm();
  }

  /**
   * Lifecycle Hook - Cleanup
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ABSTRATO: Subclasses devem implementar
   */
  abstract buildForm(): FormGroup;
  abstract onSubmit(): void;

  /**
   * Retorna erro formatado para um campo específico
   */
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return 'Campo obrigatório';
    }
    if (field.errors['email']) {
      return 'Email inválido';
    }
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['pattern']) {
      return 'Formato inválido';
    }

    return 'Campo inválido';
  }

  /**
   * Verifica se um campo tem erro
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Reset form e limpa erros
   */
  resetForm(): void {
    this.form.reset();
    this.formError$.next(null);
    this.fieldErrors.clear();
  }

  /**
   * Marca todos os campos como touched (para mostrar erros)
   */
  markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Helper para desabilitar form durante submissão
   */
  protected setSubmitting(value: boolean): void {
    this.isSubmitting$.next(value);
    if (value) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  /**
   * Helper para mostrar erro geral do form
   */
  protected setFormError(message: string): void {
    this.formError$.next(message);
    this.setSubmitting(false);
  }

  /**
   * Helper para limpar erros
   */
  protected clearErrors(): void {
    this.formError$.next(null);
    this.fieldErrors.clear();
  }
}
