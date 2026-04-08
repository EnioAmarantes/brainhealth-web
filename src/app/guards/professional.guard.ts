import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';
import { UserType } from '@app/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        console.log('ProfessionalGuard - Current User:', user);
        if (user && user.role.toUpperCase() === UserType.PROFESSIONAL) {
          return true;
        }

        // Redireciona se não é profissional
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
