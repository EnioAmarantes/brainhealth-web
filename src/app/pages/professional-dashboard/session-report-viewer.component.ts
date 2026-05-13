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
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SessionReportService } from '../../services/session-report.service';

@Component({
  selector: 'app-session-report-viewer',
  templateUrl: './session-report-viewer.component.html',
  styleUrls: ['./session-report-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  standalone: true,
})
export class SessionReportViewerComponent implements OnInit, OnDestroy {
  @Input() appointmentId!: string;
  @Input() patientName = '';
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() shared = new EventEmitter<any>();

  report: any = null;
  isLoading = false;
  isSharing = false;
  errorMessage = '';
  successMessage = '';
  shareStatus = {
    shared: false,
    sharedAt: null as string | null,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private sessionReportService: SessionReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.appointmentId && this.isOpen) {
      this.loadReport();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.sessionReportService
      .getReport(this.appointmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.report = report;
          this.shareStatus = {
            shared: report.sharedWithPatient || false,
            sharedAt: report.sharedAt || null,
          };
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMessage =
            'Relatório não encontrado. Certifique-se de que as anotações foram salvas.';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onShareWithPatient(): void {
    if (!this.report?.id) {
      this.errorMessage = 'Erro ao compartilhar relatório';
      return;
    }

    this.isSharing = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.sessionReportService
      .shareReport(this.report.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.shareStatus = {
            shared: true,
            sharedAt: new Date().toISOString(),
          };
          this.successMessage = `Relatório compartilhado com ${this.patientName}`;
          this.isSharing = false;
          this.cdr.markForCheck();
          this.shared.emit(response);
        },
        error: (error) => {
          this.errorMessage = 'Erro ao compartilhar relatório com o paciente';
          this.isSharing = false;
          this.cdr.markForCheck();
        },
      });
  }

  onPrint(): void {
    if (!this.report) {
      return;
    }

    window.print();
  }

  onDownload(): void {
    if (!this.report) {
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([this.report.formattedContent], {
      type: 'text/plain;charset=utf-8',
    });
    element.href = URL.createObjectURL(file);
    element.download = `relatorio-${this.appointmentId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  onClose(): void {
    this.report = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.close.emit();
  }

  formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get reportContent(): string[] {
    if (!this.report?.formattedContent) {
      return [];
    }
    return this.report.formattedContent.split('\n');
  }
}
