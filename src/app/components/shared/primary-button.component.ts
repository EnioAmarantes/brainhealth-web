import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-primary-button',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <button
      [disabled]="disabled || isLoading"
      [class.loading]="isLoading"
      (click)="onClick.emit()"
      class="primary-button"
      [attr.aria-label]="ariaLabel"
      type="button"
    >
      {{label}}
      <span *ngIf="isLoading" class="spinner">
        <span class="spinner-dot"></span>
      </span>
    </button>
  `,
    styles: [`
    .primary-button {
      width: 100%;
      padding: 14px 20px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
          background: #fff;
          border-radius: 50%;
          width: 4px;
          height: 4px;
          animation: spinner 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;

          &:nth-child(1) {
            left: 8px;
            animation-delay: -0.24s;
          }

          &:nth-child(2) {
            left: 32px;
            animation-delay: -0.12s;
          }

          &:nth-child(3) {
            left: 56px;
            animation-delay: 0;
          }
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
export class PrimaryButtonComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() ariaLabel: string = '';
  @Output() onClick = new EventEmitter<void>();
}
