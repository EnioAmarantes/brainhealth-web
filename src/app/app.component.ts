import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from '@app/components/shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingIndicatorComponent],
  template: `
    <app-loading-indicator></app-loading-indicator>
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: 0;
    }
  `]
})
export class AppComponent {
  title = 'brain-health-web';
}
