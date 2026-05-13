import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { AppointmentService } from '../../services/appointment.service';
import { ScheduleSettingsService } from '../../services/schedule-settings.service';

interface PatientOption {
  id: string;
  name: string;
  email: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class AppointmentModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() appointmentCreated = new EventEmitter<any>();

  appointmentForm!: FormGroup;
  patients: PatientOption[] = [];
  availableTimeSlots: TimeSlot[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  readonly recurringOptions = [
    { value: 'none', label: 'Sem recorrência' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' },
  ];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private scheduleSettingsService: ScheduleSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPatients();
    this.setupFormValueChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      appointmentDate: [dateString, Validators.required],
      appointmentTime: ['09:00', Validators.required],
      recurring: ['none', Validators.required],
      recurringUntil: [''],
      notes: [''],
    });
  }

  private setupFormValueChanges(): void {
    this.appointmentForm
      .get('appointmentDate')
      ?.valueChanges.pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadAvailableTimeSlots();
      });

    this.appointmentForm
      .get('appointmentTime')
      ?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateTimeSlot();
      });
  }

  private loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // TODO: Implement patient loading from API
    // For now, using mock data
    this.patients = [
      { id: '1', name: 'João Silva', email: 'joao@email.com' },
      { id: '2', name: 'Maria Santos', email: 'maria@email.com' },
      { id: '3', name: 'Pedro Oliveira', email: 'pedro@email.com' },
      { id: '4', name: 'Ana Costa', email: 'ana@email.com' },
      { id: '5', name: 'Carlos Mendes', email: 'carlos@email.com' },
    ];

    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private loadAvailableTimeSlots(): void {
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!selectedDate) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.scheduleSettingsService
      .getAvailableSlots('current-professional-id', new Date(selectedDate))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slots: any[]) => {
          this.availableTimeSlots = slots.map((slot) => ({
            time: slot.startTime?.split('T')[1]?.substring(0, 5) || slot.time,
            available: slot.isAvailable !== false,
          }));
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao carregar horários disponíveis';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private validateTimeSlot(): void {
    const selectedTime = this.appointmentForm.get('appointmentTime')?.value;
    const selectedSlot = this.availableTimeSlots.find(
      (slot) => slot.time === selectedTime
    );

    if (selectedSlot && !selectedSlot.available) {
      this.errorMessage = 'Este horário não está disponível';
    } else {
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (!this.appointmentForm.valid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const formValue = this.appointmentForm.value;
    
    // Parse date and time
    const startDateTime = new Date(`${formValue.appointmentDate}T${formValue.appointmentTime}:00`);
    
    // Calculate end time (assuming 60 minutes default session duration)
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 60); // Default 60 minutes

    const appointmentData = {
      patientId: formValue.patientId,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      description: formValue.notes || undefined,
    };

    // Get professional ID from localStorage or context
    const professionalId = localStorage.getItem('professionalId') || 'current-professional-id';

    this.appointmentService
      .createAppointment(professionalId, appointmentData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Consulta criada com sucesso!';
          this.appointmentCreated.emit(response);
          this.isSaving = false;
          this.cdr.markForCheck();

          setTimeout(() => {
            this.onClose();
          }, 1500);
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Erro ao criar consulta. Verifique se há conflitos de horário.';
          this.isSaving = false;
          this.cdr.markForCheck();
        },
      });
  }

  onClose(): void {
    this.appointmentForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.availableTimeSlots = [];
    this.close.emit();
  }

  getPatientName(patientId: string): string {
    const patient = this.patients.find((p) => p.id === patientId);
    return patient ? patient.name : '';
  }

  isTimeSlotDisabled(time: string): boolean {
    const slot = this.availableTimeSlots.find((s) => s.time === time);
    return slot ? !slot.available : false;
  }

  getTodayPlusOne(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  get isRecurring(): boolean {
    return this.appointmentForm.get('recurring')?.value !== 'none';
  }

  get minRecurringDate(): string {
    const selected = this.appointmentForm.get('appointmentDate')?.value;
    if (!selected) return this.getTodayPlusOne();
    return selected;
  }
}
