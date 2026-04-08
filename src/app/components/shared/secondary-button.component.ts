import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-secondary-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [disabled]="disabled || isLoading"
      [class.loading]="isLoading"
      (click)="onClick.emit()"
      class="secondary-button"
      [attr.aria-label]="ariaLabel"
      type="button"
    >
      {{ label }}
      <span *ngIf="isLoading" class="spinner">
        <span class="spinner-dot"></span>
      </span>
    </button>
  `,
  styles: [`
    .secondary-button {
      width: 100%;
      padding: 14px 20px;
      font-size: 16px;
      font-weight: 600;
      border: 2px solid #667eea;
      border-radius: 8px;
      background: transparent;
      color: #667eea;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .button-text {
        display: block;
      }

      .spinner {
        display: inline-block;
        position: relative;
        width: 20px;
        height: 20px;

        .spinner-dot {
          display: inline-block;
          position: absolute;
          left: 8px;
          background: #667eea;
          border-radius: 50%;
          width: 4px;
          height: 4px;
          animation: spinner 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
        }
      }
    }

    @keyframes spinner {
      0%, 100% {
        top: 8px;
      }
      50% {
        top: 0;
      }
    }
  `]
})
export class SecondaryButtonComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() ariaLabel: string = '';
  @Output() onClick = new EventEmitter<void>();
}
