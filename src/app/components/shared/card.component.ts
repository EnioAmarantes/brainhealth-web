import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.elevated]="elevated">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;

      &.elevated {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      &:hover {
        border-color: #667eea;
      }
    }
  `]
})
export class CardComponent {
  @Input() elevated: boolean = false;
}
