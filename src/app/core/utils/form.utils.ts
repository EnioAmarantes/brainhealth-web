import { FormGroup } from '@angular/forms';

/**
 * Utilitários para trabalhar com Forms
 */
export class FormUtils {
  /**
   * Marca todos os campos como touched
   */
  static markAllAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  /**
   * Reseta form
   */
  static resetForm(form: FormGroup): void {
    form.reset();
  }

  /**
   * Preenche form com dados
   */
  static populateForm(form: FormGroup, data: Record<string, any>): void {
    Object.keys(data).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.setValue(data[key]);
      }
    });
  }

  /**
   * Verifica se form tem erros
   */
  static hasErrors(form: FormGroup): boolean {
    return form.invalid && Object.keys(form.controls).length > 0;
  }

  /**
   * Retorna dados apenas dos campos modificados
   */
  static getDirtyValues(form: FormGroup): Record<string, any> {
    const dirty: Record<string, any> = {};
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control?.dirty) {
        dirty[key] = control.value;
      }
    });
    return dirty;
  }
}
