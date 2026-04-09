import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService, LoadingState } from '@app/services/loading.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-loading-indicator',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="loading-container" *ngIf="(loading$ | async) as loadingState">
      <div class="loading-overlay" [class.show]="loadingState.isLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p *ngIf="loadingState.message" class="loading-message">
            {{ loadingState.message }}
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 1000;

      &.show {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-message {
      color: white;
      font-size: 16px;
      font-weight: 500;
      margin: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingIndicatorComponent {
  loading$: Observable<LoadingState>;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.isLoading();
  }
}
