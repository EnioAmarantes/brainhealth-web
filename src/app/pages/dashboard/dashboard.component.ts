import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { LoadingIndicatorComponent } from '@app/components/shared';
import { Observable } from 'rxjs';
import { User, UserType } from '@app/models/auth.model';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingIndicatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-loading">
      <app-loading-indicator></app-loading-indicator>
      <p>Carregando seu dashboard...</p>
    </div>
  `,
  styles: [`
    .dashboard-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;

      p {
        margin-top: 20px;
        font-size: 16px;
        color: #7f8c8d;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.redirectToDashboardByUserType();
  }

  /**
   * Redireciona para o dashboard específico baseado no tipo de usuário
   */
  private redirectToDashboardByUserType(): void {
    // Primeiro tenta obter do localStorage (para evitar race condition)
    const userFromStorage = this.authService.getCurrentUser();
    
    if (userFromStorage) {
      this.performRedirect(userFromStorage);
      return;
    }

    // Se não encontrar no localStorage, aguarda o observable atualizar
    this.currentUser$
      .pipe(
        filter(user => user !== null), // Aguarda até ter um usuário
        take(1)
      )
      .subscribe(user => {
        if (user) {
          this.performRedirect(user);
        }
      });
  }

  /**
   * Executa o redirecionamento para a dashboard apropriada
   */
  private performRedirect(user: User): void {
    switch (user.role) {
      case UserType.PROFESSIONAL:
        this.router.navigate(['/dashboard/professional']);
        break;
      case UserType.PATIENT:
        this.router.navigate(['/dashboard/patient']);
        break;
      case UserType.ADMIN:
        this.router.navigate(['/dashboard/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
