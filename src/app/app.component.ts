import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from '@app/components/shared';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoadingIndicatorComponent],
    template: `
    <div class="app-wrapper">
      <app-loading-indicator></app-loading-indicator>
      <router-outlet></router-outlet>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
    }

    .app-wrapper {
      display: block;
      width: 100%;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
    }

    ::ng-deep app-login-selector {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'brain-health-web';
}
