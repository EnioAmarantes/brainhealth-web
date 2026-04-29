import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-whatsapp-button',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <button
      class="whatsapp-button"
      (click)="onClick.emit()"
      [attr.aria-label]="ariaLabel"
      [attr.title]="title"
      type="button"
    >
      <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.412-7.987c1.414 0 2.735.46 3.822 1.34l.278-.453c-.784-.665-1.79-1.062-3.1-1.062-3.285 0-5.95 2.667-5.95 5.95 0 1.186.383 2.296 1.026 3.212l.345-.56c-.502-.94-.78-2.008-.78-3.132 0-2.926 2.38-5.295 5.311-5.295m5.882.265C21.007 9.318 22 11.03 22 13c0 5.256-4.273 9.5-9.5 9.5-1.829 0-3.577-.496-5.082-1.372l-5.712 1.488 1.512-5.515C2.884 14.987 2 13.08 2 11c0-5.511 4.489-10 10-10 2.68 0 5.202.976 7.154 2.647zm-5.02 7.99v2.05h-1.2v-2.05h1.2z"/>
      </svg>
      <span class="whatsapp-text">{{ label }}</span>
    </button>
  `,
    styles: [`
    .whatsapp-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #25d366 0%, #20ba58 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3);
      font-family: inherit;
      width: 100%;
    }

    .whatsapp-button:hover {
      background: linear-gradient(135deg, #22c959 0%, #1fa556 100%);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      transform: translateY(-2px);
    }

    .whatsapp-button:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3);
    }

    .whatsapp-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .whatsapp-text {
      font-size: 14px;
    }
  `]
})
export class WhatsAppButtonComponent {
  @Input() label: string = 'WhatsApp';
  @Input() title: string = 'Enviar mensagem via WhatsApp';
  @Input() ariaLabel: string = 'Botão para enviar mensagem via WhatsApp';
  @Output() onClick = new EventEmitter<void>();
}
