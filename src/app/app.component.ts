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
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
      overflow: hidden;
    }

    .app-wrapper {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
    }

    ::ng-deep app-login-selector {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {
  title = 'brain-health-web';
}
