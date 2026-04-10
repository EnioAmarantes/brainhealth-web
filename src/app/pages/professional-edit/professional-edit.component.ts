import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import {
  CardComponent,
  PrimaryButtonComponent,
  SecondaryButtonComponent,
  LoadingIndicatorComponent,
} from '@app/components/shared';
import { Professional, DayOfWeek } from '@app/models/professional.model';
import { ProfessionalService } from '@app/services/professional.service';
import {
  minArrayLength,
  crpValidator,
  timeRangeValidator,
} from '@app/validators/professional-validators';

@Component({
  selector: 'app-professional-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    LoadingIndicatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './professional-edit.component.html',
  styleUrls: ['./professional-edit.component.scss'],
})
export class ProfessionalEditComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  professional: Professional | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  photoPreview: string | null = null;
  currentSection = 1;

  readonly daysOfWeek = Object.values(DayOfWeek).filter(
    (value) => typeof value === 'number'
  );
  dayLabels: { [key: number]: string } = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private professionalService: ProfessionalService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProfessionalData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa o formulário com validadores
   */
  private initializeForm(): void {
    this.editForm = this.fb.group(
      {
        // Seção Básica
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        photo: [null],

        // Seção Profissional
        crp: ['', [crpValidator()]],
        specialties: this.fb.array([], minArrayLength(1)),
        experience: [1, [Validators.required, Validators.min(0), Validators.max(70)]],
        description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
        consultationPrice: [0, [Validators.required, Validators.min(0)]],
        availableForNewPatients: [true],

        // Seção Endereço
        address: this.fb.group({
          street: ['', [Validators.required, Validators.minLength(5)]],
          city: ['', [Validators.required, Validators.minLength(2)]],
          state: ['', [Validators.required, Validators.minLength(2)]],
          zipCode: ['', [Validators.required, Validators.minLength(5)]],
          country: ['', [Validators.required, Validators.minLength(2)]],
        }),

        // Seção Disponibilidade
        availability: this.fb.group(
          {
            days: this.fb.array([], minArrayLength(1)),
            startTime: ['09:00', Validators.required],
            endTime: ['18:00', Validators.required],
          },
          { validators: timeRangeValidator() }
        ),
      }
    );
  }

  /**
   * Carrega dados do profissional atual
   */
  private loadProfessionalData(): void {
    this.isLoading = true;
    this.professionalService
      .getCurrentProfessional()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (professional) => {
          this.professional = professional;
          this.populateForm(professional);
        },
        error: () => {
          this.errorMessage =
            'Erro ao carregar seus dados. Por favor, tente novamente.';
        },
      });
  }

  /**
   * Popula o formulário com os dados do profissional
   */
  private populateForm(professional: Professional): void {
    // Dados básicos
    this.editForm.patchValue({
      fullName: professional.fullName,
      email: professional.email,
      crp: professional.crp || '',
      experience: professional.experience,
      description: professional.description,
      consultationPrice: professional.consultationPrice || 0,
      availableForNewPatients: professional.availableForNewPatients,
    });

    // Endereço
    this.editForm.get('address')?.patchValue({
      street: professional.address.street,
      city: professional.address.city,
      state: professional.address.state,
      zipCode: professional.address.zipCode,
      country: professional.address.country,
    });

    // Especialidades
    const specialtiesArray = this.editForm.get('specialties') as FormArray;
    professional.specialties.forEach((specialty) => {
      specialtiesArray.push(this.fb.control(specialty, Validators.required));
    });

    // Disponibilidade
    const daysArray = this.editForm.get(
      'availability.days'
    ) as any as FormArray;
    professional.availability.days.forEach((day) => {
      daysArray.push(this.fb.control(day, Validators.required));
    });

    this.editForm.get('availability')?.patchValue({
      startTime: professional.availability.startTime,
      endTime: professional.availability.endTime,
    });

    // Foto
    if (professional.photo) {
      this.photoPreview = professional.photo;
    }
  }

  /**
   * Obtém o FormArray de especialidades
   */
  get specialtiesArray(): FormArray {
    return this.editForm.get('specialties') as FormArray;
  }

  /**
   * Obtém o FormArray de dias disponíveis
   */
  get daysArray(): FormArray {
    return this.editForm.get('availability.days') as FormArray;
  }

  /**
   * Converte o valor do CRP para maiúsculas
   */
  onCrpInput(event: any): void {
    const value = event.target.value || '';
    const control = this.editForm.get('crp');
    if (control && value !== value.toUpperCase()) {
      control.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }

  /**
   * Adiciona uma nova especialidade
   */
  addSpecialty(): void {
    this.specialtiesArray.push(this.fb.control('', Validators.required));
  }

  /**
   * Remove uma especialidade
   */
  removeSpecialty(index: number): void {
    this.specialtiesArray.removeAt(index);
  }

  /**
   * Toggle dia da semana
   */
  toggleDay(day: number): void {
    const daysArray = this.daysArray;
    const index = daysArray.value.indexOf(day);

    if (index >= 0) {
      daysArray.removeAt(index);
    } else {
      daysArray.push(this.fb.control(day, Validators.required));
    }
  }

  /**
   * Verifica se um dia está selecionado
   */
  isDaySelected(day: number): boolean {
    return this.daysArray.value.includes(day);
  }

  /**
   * Manipula upload de foto
   */
  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validação de tipo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor, selecione uma imagem válida.';
        return;
      }

      // Validação de tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'A imagem não pode exceder 5MB.';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
        this.editForm.get('photo')?.setValue(file);
        this.errorMessage = null;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove a foto
   */
  removePhoto(): void {
    this.photoPreview = null;
    this.editForm.get('photo')?.setValue(null);
  }

  /**
   * Valida e obtém mensagens de erro para um campo
   */
  getFieldError(fieldName: string): string | null {
    const field = this.editForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (field.errors['minlength']) {
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    if (field.errors['min']) {
      return `Valor mínimo: ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `Valor máximo: ${field.errors['max'].max}`;
    }
    if (field.errors['email']) {
      return 'Email inválido';
    }
    if (field.errors['invalidCRP']) {
      return 'CRP inválido. Formato: CRP-SP-123456';
    }

    return 'Este campo contém um erro';
  }

  /**
   * Salva as alterações do profissional
   */
  onSubmit(): void {
    if (!this.editForm.valid) {
      this.markFormGroupTouched(this.editForm);
      this.errorMessage = 'Por favor, corrija os erros no formulário';
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.editForm.value;
    const updateData: Partial<Professional> = {
      fullName: formValue.fullName,
      email: formValue.email,
      crp: formValue.crp || undefined,
      specialties: formValue.specialties,
      experience: formValue.experience,
      description: formValue.description,
      consultationPrice: formValue.consultationPrice,
      availableForNewPatients: formValue.availableForNewPatients,
      address: formValue.address,
      availability: {
        days: formValue.availability.days,
        startTime: formValue.availability.startTime,
        endTime: formValue.availability.endTime,
      },
    };

    if (formValue.photo || this.photoPreview) {
      updateData.photo = this.photoPreview || undefined;
    }

    this.professionalService
      .updateCurrentProfessional(updateData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: () => {
          this.successMessage =
            'Perfil atualizado com sucesso! Redirecionando...';
          setTimeout(() => {
            this.router.navigate(['/dashboard/professional']);
          }, 1500);
        },
        error: () => {
          this.errorMessage = 'Erro ao salvar suas alterações. Tente novamente.';
        },
      });
  }

  /**
   * Volta para a página anterior
   */
  onCancel(): void {
    if (this.editForm.dirty) {
      if (confirm('Você tem alterações não salvas. Deseja descartar?')) {
        this.router.navigate(['/dashboard/professional']);
      }
    } else {
      this.router.navigate(['/dashboard/professional']);
    }
  }

  /**
   * Salva o formulário (wrapper para submit)
   */
  saveForm(): void {
    this.onSubmit();
  }

  /**
   * Vai para próxima seção
   */
  nextSection(): void {
    if (this.currentSection < 4) {
      this.currentSection++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Volta para seção anterior
   */
  previousSection(): void {
    if (this.currentSection > 1) {
      this.currentSection--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Marca todos os campos do FormGroup como touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }

      if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  /**
   * Calcula progresso do formulário
   */
  get formProgress(): number {
    const formValue = this.editForm.value;
    let filledFields = 0;
    let totalFields = 0;

    const countFields = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            totalFields += 1;
            if (obj[key].length > 0) filledFields += 1;
          } else {
            countFields(obj[key]);
          }
        } else {
          totalFields += 1;
          if (obj[key]) filledFields += 1;
        }
      });
    };

    countFields(formValue);
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }
}
