import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Classe base para modais reutilizáveis
 */
@Component({
  template: ''
})
export abstract class BaseModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() confirmButtonText = 'Confirmar';
  @Input() cancelButtonText = 'Cancelar';
  @Input() isLoading = false;
  @Input() isDanger = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }

  close(): void {
    this.cancel();
  }
}
