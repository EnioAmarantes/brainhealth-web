import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { ChangeDetectorRef as Angular2ChangeDetectorRef } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { ProfessionalService } from '../../services/professional.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentModalComponent } from './appointment-modal.component';
import { BehaviorSubject } from 'rxjs';
import { Professional } from '../../models/professional.model';

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

@Component({
  selector: 'app-scheduling-dashboard',
  templateUrl: './scheduling-dashboard.component.html',
  styleUrls: ['./scheduling-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    AppointmentModalComponent,
  ],
  standalone: true,
})
export class SchedulingDashboardComponent implements OnInit {
  activeTab: 'agenda' | 'settings' = 'agenda';
  isLoading = false;
  isAppointmentModalOpen = false;
  currentProfessional$ = new BehaviorSubject<Professional | null>(null);
  stats: AppointmentStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  };

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private professionalService: ProfessionalService,
    private authService: AuthService,
    private cdr: Angular2ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfessionalData();
    this.loadStats();
  }

  private loadProfessionalData(): void {
    this.professionalService.getCurrentProfessional()
      .subscribe({
        next: (professional) => {
          this.currentProfessional$.next(professional);
        },
        error: (error) => {
          console.error('Erro ao carregar profissional:', error);
        }
      });
  }

  private loadStats(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    // TODO: Load actual stats from service
    // For now, using mock data
    this.stats = {
      total: 12,
      pending: 3,
      confirmed: 7,
      inProgress: 1,
      completed: 1,
      cancelled: 0,
    };

    this.isLoading = false;
    this.cdr.markForCheck();
  }

  switchTab(tab: 'agenda' | 'settings'): void {
    this.activeTab = tab;
    if (tab === 'agenda') {
      this.router.navigate(['../agenda'], { relativeTo: this.router.routerState.root });
    } else if (tab === 'settings') {
      this.router.navigate(['../settings'], { relativeTo: this.router.routerState.root });
    }
  }

  openAppointmentModal(): void {
    this.isAppointmentModalOpen = true;
    this.cdr.markForCheck();
  }

  closeAppointmentModal(): void {
    this.isAppointmentModalOpen = false;
    this.loadStats();
    this.cdr.markForCheck();
  }

  onAppointmentCreated(appointment: any): void {
    this.loadStats();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'inprogress':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#2563eb';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard/professional']);
  }
}
