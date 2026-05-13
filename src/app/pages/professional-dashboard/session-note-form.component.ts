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
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SessionNoteService } from '../../services/session-note.service';
import { SessionReportService } from '../../services/session-report.service';

@Component({
  selector: 'app-session-note-form',
  templateUrl: './session-note-form.component.html',
  styleUrls: ['./session-note-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class SessionNoteFormComponent implements OnInit, OnDestroy {
  @Input() appointmentId!: string;
  @Input() patientName = '';
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() noteSaved = new EventEmitter<any>();

  noteForm!: FormGroup;
  existingNote: any = null;
  isLoading = false;
  isSaving = false;
  isGeneratingReport = false;
  errorMessage = '';
  successMessage = '';
  reportGenerated = false;

  private destroy$ = new Subject<void>();

  readonly moodRatings = [
    { value: 1, label: 'Muito baixo', icon: '😢' },
    { value: 2, label: 'Baixo', icon: '😔' },
    { value: 3, label: 'Neutro', icon: '😐' },
    { value: 4, label: 'Bom', icon: '🙂' },
    { value: 5, label: 'Muito bom', icon: '😊' },
  ];

  constructor(
    private fb: FormBuilder,
    private sessionNoteService: SessionNoteService,
    private sessionReportService: SessionReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.appointmentId) {
      this.loadExistingNote();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.noteForm = this.fb.group({
      patientMoodRating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      topicsDiscussed: ['', [Validators.required, Validators.minLength(10)]],
      progressObservations: ['', [Validators.required, Validators.minLength(10)]],
      recommendations: ['', [Validators.required, Validators.minLength(10)]],
      homework: [''],
    });
  }

  private loadExistingNote(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.sessionNoteService
      .getNoteByAppointment(this.appointmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (note) => {
          if (note) {
            this.existingNote = note;
            this.noteForm.patchValue(note);
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          // Note might not exist yet - that's okay
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSubmit(): void {
    if (!this.noteForm.valid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const formValue = this.noteForm.value;

    if (this.existingNote) {
      // Update existing note
      this.sessionNoteService
        .updateNote(this.existingNote.id, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = 'Anotações atualizadas com sucesso!';
            this.existingNote = response;
            this.isSaving = false;
            this.cdr.markForCheck();
            this.noteSaved.emit(response);
          },
          error: (error) => {
            this.errorMessage = 'Erro ao atualizar anotações';
            this.isSaving = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      // Create new note
      const noteData = {
        appointmentId: this.appointmentId,
        ...formValue,
      };

      this.sessionNoteService
        .createNote(noteData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = 'Anotações salvas com sucesso!';
            this.existingNote = response;
            this.isSaving = false;
            this.cdr.markForCheck();
            this.noteSaved.emit(response);
          },
          error: (error) => {
            this.errorMessage = 'Erro ao salvar anotações';
            this.isSaving = false;
            this.cdr.markForCheck();
          },
        });
    }
  }

  onGenerateReport(): void {
    if (!this.existingNote?.id) {
      this.errorMessage = 'Salve as anotações antes de gerar o relatório';
      return;
    }

    this.isGeneratingReport = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.sessionReportService
      .generateReport(this.appointmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.successMessage = 'Relatório gerado com sucesso!';
          this.reportGenerated = true;
          this.isGeneratingReport = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao gerar relatório';
          this.isGeneratingReport = false;
          this.cdr.markForCheck();
        },
      });
  }

  onClose(): void {
    this.noteForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.reportGenerated = false;
    this.close.emit();
  }

  getMoodLabel(value: number): string {
    const mood = this.moodRatings.find((m) => m.value === value);
    return mood ? `${mood.icon} ${mood.label}` : '';
  }

  getMoodIcon(value: number): string {
    const mood = this.moodRatings.find((m) => m.value === value);
    return mood ? mood.icon : '';
  }

  get canGenerateReport(): boolean {
    return this.existingNote && this.noteForm.valid && !this.reportGenerated;
  }

  get wordCount(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    ['topicsDiscussed', 'progressObservations', 'recommendations'].forEach(
      (field) => {
        const value = this.noteForm.get(field)?.value || '';
        counts[field] = value.split(/\s+/).filter((word: string) => word.length > 0).length;
      }
    );
    return counts;
  }
}
