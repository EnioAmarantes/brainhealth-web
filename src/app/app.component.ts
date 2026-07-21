import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `
    <div class="app-wrapper">
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
