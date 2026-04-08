import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        // Verificar se há usuário no localStorage (mesmo que isAuthenticated$ ainda não tenha sido atualizado)
        const currentUser = this.authService.getCurrentUser();
        const token = this.authService.getToken();
        
        if (isAuthenticated || (currentUser && token)) {
          return true;
        }

        // Redireciona para login se não autenticado
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
