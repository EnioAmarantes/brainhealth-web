import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, AppointmentDto } from '@app/services/appointment.service';
import { PrimaryButtonComponent, SecondaryButtonComponent, CardComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

type ViewMode = 'weekly' | 'monthly';

interface DayWithAppointments {
  date: Date;
  day: number;
  appointments: AppointmentDto[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
}

@Component({
  selector: 'app-schedule-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    CardComponent,
    LoadingIndicatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./schedule-viewer.component.scss'],
  template: `
    <div class="schedule-viewer-container">
      <!-- Header -->
      <header class="viewer-header">
        <h1 class="page-title">📅 Minha Agenda</h1>
        <p class="page-subtitle">Visualize seus agendamentos confirmados</p>
      </header>

      <!-- Controls -->
      <div class="controls-bar">
        <div class="view-switcher">
          <button
            (click)="switchView('weekly')"
            [class.active]="(viewMode$ | async) === 'weekly'"
            class="view-btn"
          >
            📅 Semanal
          </button>
          <button
            (click)="switchView('monthly')"
            [class.active]="(viewMode$ | async) === 'monthly'"
            class="view-btn"
          >
            🗓️ Mensal
          </button>
        </div>

        <div class="date-controls">
          <button (click)="previousPeriod()" class="nav-btn" title="Período anterior">
            ◀
          </button>
          <span class="current-period">{{ getCurrentPeriodLabel() }}</span>
          <button (click)="nextPeriod()" class="nav-btn" title="Próximo período">
            ▶
          </button>
        </div>

        <button (click)="goToToday()" class="today-btn">
          📍 Hoje
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading$ | async) {
        <div class="loading-state">
          <app-loading-indicator></app-loading-indicator>
          <p>Carregando agenda...</p>
        </div>
      }

      <!-- Error State -->
      @if (error$ | async; as error) {
        <div class="error-alert">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
        </div>
      }

      <!-- Weekly View -->
      @if ((viewMode$ | async) === 'weekly' && !(isLoading$ | async)) {
        <div class="weekly-view">
          <div class="week-header">
            @for (dayHeader of weekDayHeaders; track dayHeader) {
              <div class="week-day-header">{{ dayHeader }}</div>
            }
          </div>

          <div class="week-grid">
            @for (day of (weekDays$ | async); track day?.date?.getTime()) {
              <div
                class="day-cell"
                [class.other-month]="!(day?.isCurrentMonth)"
                [class.today]="day?.isToday"
              >
                <div class="day-number">{{ day?.day }}</div>
                <div class="appointments-list">
                  @if (day?.appointments && day.appointments.length > 0) {
                    @for (apt of day.appointments; track apt.id) {
                      <div
                        class="appointment-item"
                        [class.status-confirmed]="apt.status === 'Confirmed'"
                        [class.status-pending]="apt.status === 'Pending'"
                        [class.status-in-progress]="apt.status === 'InProgress'"
                        (click)="selectAppointment(apt)"
                        [title]="apt.patientName"
                      >
                        <div class="apt-time">{{ getTimeFromDate(apt.startDateTime) }}</div>
                        <div class="apt-patient">{{ apt.patientName | slice: 0:15 }}</div>
                      </div>
                    }
                  } @else {
                    <div class="no-appointments">-</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Monthly View -->
      @if ((viewMode$ | async) === 'monthly' && !(isLoading$ | async)) {
        <div class="monthly-view">
          <div class="month-header">
            @for (dayHeader of weekDayHeaders; track dayHeader) {
              <div class="month-day-header">{{ dayHeader }}</div>
            }
          </div>

          <div class="month-grid">
            @for (day of (monthDays$ | async); track day?.date?.getTime()) {
              <div
                class="month-cell"
                [class.other-month]="!(day?.isCurrentMonth)"
                [class.today]="day?.isToday"
                [class.has-appointments]="day?.appointments && day.appointments.length > 0"
              >
                <div class="month-day-number">{{ day?.day }}</div>
                <div class="appointment-count">
                  @if (day?.appointments && day.appointments.length > 0) {
                    <span class="count-badge">{{ day.appointments.length }}</span>
                  }
                </div>
                <div class="appointments-preview">
                  @if (day?.appointments && day.appointments.length > 0) {
                    @for (apt of day.appointments.slice(0, 2); track apt.id) {
                      <div class="apt-preview" [title]="apt.patientName">
                        {{ getTimeFromDate(apt.startDateTime) }}
                      </div>
                    }
                    @if (day.appointments.length > 2) {
                      <div class="apt-preview more">
                        +{{ day.appointments.length - 2 }} mais
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Appointment Details Panel -->
      @if (selectedAppointment$ | async; as appointment) {
        <div class="details-panel">
          <div class="panel-header">
            <h3>Detalhes do Agendamento</h3>
            <button (click)="clearSelection()" class="close-btn">✕</button>
          </div>

          <div class="panel-content">
            <div class="detail-group">
              <label>Paciente</label>
              <p>{{ appointment.patientName }}</p>
              <p class="secondary">{{ appointment.patientEmail }}</p>
            </div>

            <div class="detail-group">
              <label>Data e Hora</label>
              <p>{{ appointment.startDateTime | date: 'dd/MM/yyyy HH:mm' }}</p>
              <p class="secondary">
                até {{ appointment.endDateTime | date: 'HH:mm' }}
              </p>
            </div>

            <div class="detail-group">
              <label>Status</label>
              <p class="status-badge" [class]="'status-' + appointment.status.toLowerCase()">
                {{ getStatusLabel(appointment.status) }}
              </p>
            </div>

            @if (appointment.description) {
              <div class="detail-group">
                <label>Descrição</label>
                <p>{{ appointment.description }}</p>
              </div>
            }

            @if (appointment.notes) {
              <div class="detail-group">
                <label>Notas Profissionais</label>
                <p>{{ appointment.notes }}</p>
              </div>
            }

            <div class="panel-actions">
              <app-secondary-button
                label="Fechar"
                (onClick)="clearSelection()"
              ></app-secondary-button>
              @if (appointment.status === 'InProgress') {
                <app-primary-button
                  label="✍️ Anotações"
                  (onClick)="openSessionNotes(appointment.id)"
                ></app-primary-button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Statistics -->
      <div class="statistics-section">
        <h3>📊 Estatísticas</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total de Agendamentos</div>
            <div class="stat-value">{{ getTotalAppointments() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Confirmados</div>
            <div class="stat-value confirmed">{{ getConfirmedCount() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Pendentes</div>
            <div class="stat-value pending">{{ getPendingCount() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Em Andamento</div>
            <div class="stat-value in-progress">{{ getInProgressCount() }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScheduleViewerComponent implements OnInit {
  viewMode$ = new BehaviorSubject<ViewMode>('weekly');
  isLoading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  selectedAppointment$ = new BehaviorSubject<AppointmentDto | null>(null);
  weekDays$ = new BehaviorSubject<DayWithAppointments[]>([]);
  monthDays$ = new BehaviorSubject<DayWithAppointments[]>([]);

  currentDate = new Date();
  weekDayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
  professionalId = '';
  allAppointments: AppointmentDto[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {
    // TODO: Get professionalId from route params or auth service
    this.professionalId = localStorage.getItem('professionalId') || '';
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (!this.professionalId) return;

    this.isLoading$.next(true);
    this.error$.next(null);

    const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    this.appointmentService
      .getProfessionalAppointments(this.professionalId, startOfMonth, endOfMonth)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (appointments) => {
          this.allAppointments = appointments;
          this.updateCalendarViews();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.error$.next(error?.error?.message || 'Erro ao carregar agenda');
          this.cdr.markForCheck();
        }
      });
  }

  switchView(mode: ViewMode): void {
    this.viewMode$.next(mode);
    this.cdr.markForCheck();
  }

  previousPeriod(): void {
    if (this.viewMode$.value === 'weekly') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.loadAppointments();
  }

  nextPeriod(): void {
    if (this.viewMode$.value === 'weekly') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.loadAppointments();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadAppointments();
  }

  getCurrentPeriodLabel(): string {
    if (this.viewMode$.value === 'weekly') {
      const weekStart = this.getWeekStart(this.currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      return `${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}`;
    } else {
      return this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - (day - 1));
    return d;
  }

  private updateCalendarViews(): void {
    this.weekDays$.next(this.generateWeekDays());
    this.monthDays$.next(this.generateMonthDays());
  }

  private generateWeekDays(): DayWithAppointments[] {
    const weekStart = this.getWeekStart(this.currentDate);
    const days: DayWithAppointments[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentDate.getMonth(),
        isToday: this.isSameDay(date, today),
        appointments: this.getAppointmentsForDay(date)
      });
    }

    return days;
  }

  private generateMonthDays(): DayWithAppointments[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay() || 7;
    const days: DayWithAppointments[] = [];
    const today = new Date();

    // Dias do mês anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i + 1);
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        appointments: []
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        appointments: this.getAppointmentsForDay(date)
      });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        appointments: []
      });
    }

    return days;
  }

  private getAppointmentsForDay(date: Date): AppointmentDto[] {
    return this.allAppointments.filter(apt =>
      this.isSameDay(new Date(apt.startDateTime), date)
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getTimeFromDate(date: any): string {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  selectAppointment(appointment: AppointmentDto): void {
    this.selectedAppointment$.next(appointment);
    this.cdr.markForCheck();
  }

  clearSelection(): void {
    this.selectedAppointment$.next(null);
    this.cdr.markForCheck();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': '⏳ Pendente',
      'Confirmed': '✅ Confirmado',
      'InProgress': '🔄 Em Andamento',
      'Completed': '✔️ Concluído',
      'Cancelled': '❌ Cancelado',
      'NoShow': '⚠️ Não Compareceu'
    };
    return labels[status] || status;
  }

  openSessionNotes(appointmentId: string): void {
    // TODO: Navigate to session notes modal
  }

  getTotalAppointments(): number {
    return this.allAppointments.length;
  }

  getConfirmedCount(): number {
    return this.allAppointments.filter(a => a.status === 'Confirmed').length;
  }

  getPendingCount(): number {
    return this.allAppointments.filter(a => a.status === 'Pending').length;
  }

  getInProgressCount(): number {
    return this.allAppointments.filter(a => a.status === 'InProgress').length;
  }
}
