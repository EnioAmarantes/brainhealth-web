import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScheduleSettingsService, ProfessionalScheduleSettingsDto, UpdateScheduleSettingsRequest } from '@app/services/schedule-settings.service';
import { PrimaryButtonComponent, SecondaryButtonComponent, CardComponent, LoadingIndicatorComponent } from '@app/components/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-schedule-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    CardComponent,
    LoadingIndicatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./schedule-settings.component.scss'],
  template: `
    <div class="schedule-settings-container">
      <!-- Header -->
      <header class="settings-header">
        <h1 class="page-title">⚙️ Configurações de Agenda</h1>
        <p class="page-subtitle">Configure sua disponibilidade de atendimento</p>
      </header>

      <!-- Loading State -->
      @if (isLoading$ | async) {
        <div class="loading-state">
          <app-loading-indicator></app-loading-indicator>
          <p>Carregando configurações...</p>
        </div>
      }

      <!-- Error State -->
      @if (error$ | async; as error) {
        <div class="error-alert">
          <span class="error-icon">⚠️</span>
          <div class="error-content">
            <h3>Erro ao carregar configurações</h3>
            <p>{{ error }}</p>
            <app-secondary-button
              label="Tentar Novamente"
              (onClick)="loadSettings()"
            ></app-secondary-button>
          </div>
        </div>
      }

      <!-- Main Form -->
      @if (!(isLoading$ | async) && !(error$ | async)) {
        <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="settings-form">
          <!-- Sessions Per Week -->
          <app-card class="form-card">
            <div class="card-header">
              <h2>📅 Sessões por Semana</h2>
              <p class="card-subtitle">Defina quantas sessões você pode atender por semana</p>
            </div>
            <div class="form-group">
              <label for="maxSessions">Máximo de Sessões</label>
              <div class="input-group">
                <input
                  id="maxSessions"
                  type="number"
                  formControlName="maxSessionsPerWeek"
                  min="1"
                  max="50"
                  class="form-input"
                  placeholder="Ex: 10"
                />
                <span class="input-unit">sessões/semana</span>
              </div>
              @if (getFieldError('maxSessionsPerWeek'); as error) {
                <span class="field-error">{{ error }}</span>
              }
            </div>

            <!-- Preview -->
            <div class="preview-box">
              <div class="preview-label">Capacidade por dia (5 dias úteis):</div>
              <div class="preview-value">
                ~{{ (settingsForm.get('maxSessionsPerWeek')?.value || 10) / 5 | number: '1.0-1' }}
                sessões/dia
              </div>
            </div>
          </app-card>

          <!-- Session Duration -->
          <app-card class="form-card">
            <div class="card-header">
              <h2>⏱️ Duração das Sessões</h2>
              <p class="card-subtitle">Quanto tempo dura cada sessão</p>
            </div>
            <div class="form-group">
              <label for="duration">Duração Padrão</label>
              <div class="input-group">
                <input
                  id="duration"
                  type="number"
                  formControlName="sessionDurationMinutes"
                  min="15"
                  max="240"
                  step="15"
                  class="form-input"
                  placeholder="Ex: 60"
                />
                <span class="input-unit">minutos</span>
              </div>
              @if (getFieldError('sessionDurationMinutes'); as error) {
                <span class="field-error">{{ error }}</span>
              }
            </div>

            <!-- Common Durations -->
            <div class="quick-select">
              <label>Durações comuns:</label>
              <div class="button-group">
                @for (duration of [30, 45, 60, 90, 120]; track duration) {
                  <button
                    type="button"
                    (click)="setDuration(duration)"
                    [class.active]="settingsForm.get('sessionDurationMinutes')?.value === duration"
                    class="quick-btn"
                  >
                    {{ duration }}min
                  </button>
                }
              </div>
            </div>
          </app-card>

          <!-- Working Hours -->
          <app-card class="form-card">
            <div class="card-header">
              <h2>🕐 Horários de Funcionamento</h2>
              <p class="card-subtitle">Horário de início e término do expediente</p>
            </div>
            <div class="time-inputs">
              <div class="form-group">
                <label for="startTime">Início do Expediente</label>
                <input
                  id="startTime"
                  type="time"
                  formControlName="startTime"
                  class="form-input"
                />
                @if (getFieldError('startTime'); as error) {
                  <span class="field-error">{{ error }}</span>
                }
              </div>

              <div class="separator">até</div>

              <div class="form-group">
                <label for="endTime">Fim do Expediente</label>
                <input
                  id="endTime"
                  type="time"
                  formControlName="endTime"
                  class="form-input"
                />
                @if (getFieldError('endTime'); as error) {
                  <span class="field-error">{{ error }}</span>
                }
              </div>
            </div>

            <!-- Common Hours -->
            <div class="quick-select">
              <label>Horários comuns:</label>
              <div class="button-group">
                <button
                  type="button"
                  (click)="setWorkingHours('08:00', '18:00')"
                  class="quick-btn"
                  [class.active]="
                    settingsForm.get('startTime')?.value === '08:00' &&
                    settingsForm.get('endTime')?.value === '18:00'
                  "
                >
                  08:00 - 18:00
                </button>
                <button
                  type="button"
                  (click)="setWorkingHours('09:00', '17:00')"
                  class="quick-btn"
                  [class.active]="
                    settingsForm.get('startTime')?.value === '09:00' &&
                    settingsForm.get('endTime')?.value === '17:00'
                  "
                >
                  09:00 - 17:00
                </button>
                <button
                  type="button"
                  (click)="setWorkingHours('10:00', '19:00')"
                  class="quick-btn"
                  [class.active]="
                    settingsForm.get('startTime')?.value === '10:00' &&
                    settingsForm.get('endTime')?.value === '19:00'
                  "
                >
                  10:00 - 19:00
                </button>
              </div>
            </div>
          </app-card>

          <!-- Working Days -->
          <app-card class="form-card">
            <div class="card-header">
              <h2>📆 Dias de Trabalho</h2>
              <p class="card-subtitle">Selecione os dias em que você atende</p>
            </div>
            <div class="days-grid">
              @for (day of workingDays; track day.value) {
                <label class="day-checkbox">
                  <input
                    type="checkbox"
                    [checked]="isWorkingDay(day.value)"
                    (change)="toggleWorkingDay(day.value)"
                    class="checkbox-input"
                  />
                  <span class="day-label">{{ day.label }}</span>
                </label>
              }
            </div>
          </app-card>

          <!-- Break Between Sessions -->
          <app-card class="form-card">
            <div class="card-header">
              <h2>⏸️ Intervalo Entre Sessões</h2>
              <p class="card-subtitle">Tempo de descanso entre consultas</p>
            </div>
            <div class="form-group">
              <label for="breakTime">Intervalo</label>
              <div class="input-group">
                <input
                  id="breakTime"
                  type="number"
                  formControlName="breakBetweenSessionsMinutes"
                  min="0"
                  max="120"
                  step="5"
                  class="form-input"
                  placeholder="Ex: 15"
                />
                <span class="input-unit">minutos</span>
              </div>
              <small class="field-hint">
                Tempo para você descansar, se deslocar ou preparar entre sessões
              </small>
              @if (getFieldError('breakBetweenSessionsMinutes'); as error) {
                <span class="field-error">{{ error }}</span>
              }
            </div>
          </app-card>

          <!-- Cancellation Deadline -->
          <app-card class="form-card">
            <div class="card-header">
              <h2>🚫 Prazo de Cancelamento</h2>
              <p class="card-subtitle">Quanto tempo antes da consulta o paciente pode cancelar</p>
            </div>
            <div class="form-group">
              <label for="deadline">Prazo</label>
              <div class="input-group">
                <input
                  id="deadline"
                  type="number"
                  formControlName="cancellationDeadlineHours"
                  min="0"
                  max="168"
                  class="form-input"
                  placeholder="Ex: 24"
                />
                <span class="input-unit">horas</span>
              </div>
              @if (getFieldError('cancellationDeadlineHours'); as error) {
                <span class="field-error">{{ error }}</span>
              }

              <!-- Quick Select Deadlines -->
              <div class="quick-select">
                <label>Prazos comuns:</label>
                <div class="button-group">
                  @for (hours of [0, 12, 24, 48]; track hours) {
                    <button
                      type="button"
                      (click)="setDeadline(hours)"
                      [class.active]="settingsForm.get('cancellationDeadlineHours')?.value === hours"
                      class="quick-btn"
                    >
                      {{ hours === 0 ? 'Sem limite' : hours + 'h' }}
                    </button>
                  }
                </div>
              </div>

              <div class="preview-box">
                <div class="preview-label">Exemplo:</div>
                <small>
                  Se uma consulta é às 14:00 de segunda-feira,
                  o paciente pode cancelar até
                  {{ getDeadlineExample() }}
                </small>
              </div>
            </div>
          </app-card>

          <!-- Summary -->
          <app-card class="summary-card">
            <div class="summary-content">
              <h3>📊 Resumo da Sua Agenda</h3>
              <ul class="summary-list">
                <li>
                  <span class="summary-label">Sessões por semana:</span>
                  <span class="summary-value">{{ settingsForm.get('maxSessionsPerWeek')?.value || '-' }}</span>
                </li>
                <li>
                  <span class="summary-label">Duração:</span>
                  <span class="summary-value">{{ settingsForm.get('sessionDurationMinutes')?.value || '-' }} min</span>
                </li>
                <li>
                  <span class="summary-label">Horário:</span>
                  <span class="summary-value">
                    {{ settingsForm.get('startTime')?.value || '-' }} a {{ settingsForm.get('endTime')?.value || '-' }}
                  </span>
                </li>
                <li>
                  <span class="summary-label">Dias de trabalho:</span>
                  <span class="summary-value">{{ getWorkingDaysLabel() }}</span>
                </li>
              </ul>
            </div>
          </app-card>

          <!-- Form Actions -->
          <div class="form-actions">
            <app-secondary-button
              label="Cancelar"
              (onClick)="cancel()"
              [disabled]="(isSaving$ | async) ?? false"
            ></app-secondary-button>
            <app-primary-button
              label="💾 Salvar Configurações"
              [disabled]="!settingsForm.valid || ((isSaving$ | async) ?? false)"
              (onClick)="saveSettings()"
            ></app-primary-button>
          </div>

          <!-- Success Message -->
          @if (successMessage$ | async; as message) {
            <div class="success-message">
              <span class="success-icon">✅</span>
              <p>{{ message }}</p>
            </div>
          }
        </form>
      }
    </div>
  `
})
export class ScheduleSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  professionalId$ = new BehaviorSubject<string>('');
  isLoading$ = new BehaviorSubject<boolean>(false);
  isSaving$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  successMessage$ = new BehaviorSubject<string | null>(null);

  workingDays = [
    { label: 'Segunda', value: 1 },
    { label: 'Terça', value: 2 },
    { label: 'Quarta', value: 3 },
    { label: 'Quinta', value: 4 },
    { label: 'Sexta', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 7 }
  ];

  constructor(
    private fb: FormBuilder,
    private scheduleSettingsService: ScheduleSettingsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['professionalId']) {
        this.professionalId$.next(params['professionalId']);
        this.loadSettings();
      }
    });
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      maxSessionsPerWeek: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      sessionDurationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      startTime: ['08:00', [Validators.required]],
      endTime: ['18:00', [Validators.required]],
      workingDays: ['1,2,3,4,5', [Validators.required]],
      breakBetweenSessionsMinutes: [0, [Validators.required, Validators.min(0), Validators.max(120)]],
      cancellationDeadlineHours: [24, [Validators.required, Validators.min(0), Validators.max(168)]]
    });
  }

  loadSettings(): void {
    const professionalId = this.professionalId$.value;
    if (!professionalId) return;

    this.isLoading$.next(true);
    this.error$.next(null);

    this.scheduleSettingsService.getSettings(professionalId)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (settings) => this.populateForm(settings),
        error: (error) => {
          this.error$.next(error?.error?.message || 'Erro ao carregar configurações');
          this.cdr.markForCheck();
        }
      });
  }

  private populateForm(settings: ProfessionalScheduleSettingsDto): void {
    this.settingsForm.patchValue({
      maxSessionsPerWeek: settings.maxSessionsPerWeek,
      sessionDurationMinutes: settings.sessionDurationMinutes,
      startTime: settings.startTime,
      endTime: settings.endTime,
      workingDays: settings.workingDays,
      breakBetweenSessionsMinutes: settings.breakBetweenSessionsMinutes,
      cancellationDeadlineHours: settings.cancellationDeadlineHours
    });
    this.cdr.markForCheck();
  }

  saveSettings(): void {
    if (!this.settingsForm.valid) return;

    const professionalId = this.professionalId$.value;
    if (!professionalId) return;

    this.isSaving$.next(true);
    this.successMessage$.next(null);

    const request: UpdateScheduleSettingsRequest = {
      maxSessionsPerWeek: this.settingsForm.get('maxSessionsPerWeek')?.value,
      sessionDurationMinutes: this.settingsForm.get('sessionDurationMinutes')?.value,
      startTime: this.settingsForm.get('startTime')?.value,
      endTime: this.settingsForm.get('endTime')?.value,
      workingDays: this.settingsForm.get('workingDays')?.value,
      breakBetweenSessionsMinutes: this.settingsForm.get('breakBetweenSessionsMinutes')?.value,
      cancellationDeadlineHours: this.settingsForm.get('cancellationDeadlineHours')?.value
    };

    this.scheduleSettingsService.updateSettings(professionalId, request)
      .pipe(finalize(() => this.isSaving$.next(false)))
      .subscribe({
        next: () => {
          this.successMessage$.next('Configurações salvas com sucesso! ✨');
          setTimeout(() => this.successMessage$.next(null), 5000);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.error$.next(error?.error?.message || 'Erro ao salvar configurações');
          this.cdr.markForCheck();
        }
      });
  }

  setDuration(minutes: number): void {
    this.settingsForm.get('sessionDurationMinutes')?.setValue(minutes);
  }

  setWorkingHours(start: string, end: string): void {
    this.settingsForm.patchValue({
      startTime: start,
      endTime: end
    });
  }

  setDeadline(hours: number): void {
    this.settingsForm.get('cancellationDeadlineHours')?.setValue(hours);
  }

  isWorkingDay(day: number): boolean {
    const workingDays = this.settingsForm.get('workingDays')?.value || '';
    return workingDays.split(',').map((d: string) => parseInt(d.trim())).includes(day);
  }

  toggleWorkingDay(day: number): void {
    const currentDays = (this.settingsForm.get('workingDays')?.value || '')
      .split(',')
      .map((d: string) => parseInt(d.trim()));

    if (currentDays.includes(day)) {
      currentDays.splice(currentDays.indexOf(day), 1);
    } else {
      currentDays.push(day);
    }

    currentDays.sort((a: number, b: number) => a - b);
    this.settingsForm.get('workingDays')?.setValue(currentDays.join(','));
  }

  getWorkingDaysLabel(): string {
    const days = (this.settingsForm.get('workingDays')?.value || '')
      .split(',')
      .map((d: string) => {
        const dayNum = parseInt(d.trim());
        return this.workingDays.find((wd: any) => wd.value === dayNum)?.label || '';
      })
      .filter((d: string) => !!d);

    if (days.length === 7) return 'Todos os dias';
    if (days.length === 5 && this.isWorkingDay(1) && !this.isWorkingDay(6)) {
      return 'Segunda a sexta';
    }
    return days.join(', ');
  }

  getDeadlineExample(): string {
    const hours = this.settingsForm.get('cancellationDeadlineHours')?.value || 0;
    if (hours === 0) return 'até a hora da sessão';

    const deadline = new Date(new Date().getTime() + hours * 60 * 60 * 1000);
    return deadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.settingsForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return null;

    if (control.errors['required']) return 'Este campo é obrigatório';
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;

    return null;
  }

  cancel(): void {
    this.settingsForm.reset();
    this.loadSettings();
  }
}
