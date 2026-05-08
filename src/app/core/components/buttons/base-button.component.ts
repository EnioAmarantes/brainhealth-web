import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Classe base para botões reutilizáveis
 * Reduz duplicação de code entre PrimaryButton e SecondaryButton
 */
@Component({
  template: ''
})
export abstract class BaseButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() label = '';
  @Input() fullWidth = false;
  @Input() icon: string | null = null;

  @Output() onClick = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled && !this.isLoading) {
      this.onClick.emit();
    }
  }

  get buttonClasses(): string {
    return `btn btn-${this.variant} btn-${this.size} ${this.fullWidth ? 'btn-full' : ''}`;
  }

  get isDisabled(): boolean {
    return this.disabled || this.isLoading;
  }
}
