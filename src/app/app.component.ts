import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="app-wrapper">
      <header class="topbar">
        <div class="brand">Brain Health</div>
        <nav class="topbar-actions" aria-label="Acessos de login">
          <!-- <a
            class="topbar-btn"
            routerLink="/login/paciente"
            routerLinkActive="topbar-btn-active">
            Login Paciente
          </a> -->
          <a
            class="topbar-btn"
            routerLink="/login/profissional"
            routerLinkActive="topbar-btn-active">
            Login Profissional
          </a>
        </nav>
      </header>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
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
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      border: 0;
      box-sizing: border-box;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1rem;
      background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    }

    .brand {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #f8f9ff;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .topbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #f8f9ff;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    .topbar-btn:hover {
      background-color: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.55);
    }

    .topbar-btn-active {
      background-color: #f8f9ff;
      color: #0d1b2a;
      border-color: #f8f9ff;
    }

    .content {
      display: block;
      width: 100%;
      min-height: calc(100vh - 64px);
      flex: 1;
    }

    @media (max-width: 700px) {
      .topbar {
        flex-direction: column;
        align-items: stretch;
      }

      .brand {
        text-align: center;
      }

      .topbar-actions {
        justify-content: center;
      }
    }

    ::ng-deep app-login {
      display: block;
      width: 100%;
      min-height: calc(100vh - 64px);
    }

    ::ng-deep app-questionnaire-screen,
    ::ng-deep app-questionnaire-result {
      display: block;
      width: 100%;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent {
  title = 'brain-health-web';
}
