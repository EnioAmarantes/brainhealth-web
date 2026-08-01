import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  QuestionType,
  QuestionnaireAnswerResponse,
  QuestionnaireTemplate,
  QuestionItem,
  QuestionnaireQuestionsPayload
} from '@app/models/questionnaire.model';
import { QuestionnaireService } from '@app/services/questionnaire.service';

@Component({
  selector: 'app-questionnaire-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './questionnaire-screen.component.html',
  styleUrl: './questionnaire-screeen.component.scss'
})
export class QuestionnaireScreenComponent implements OnInit {
  private static readonly PHQ9_TEMPLATE_TYPE = 'PHQ-9';
  readonly maxDescriptionLength = 1000;

  readonly QuestionType = QuestionType;

  readonly selectedTemplate = signal<QuestionnaireTemplate | null>(null);
  readonly questions = signal<QuestionItem[]>([]);
  readonly loadingTemplates = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly templateError = signal<string>('');
  readonly submitError = signal<string>('');
  readonly submissionResult = signal<QuestionnaireAnswerResponse | null>(null);
  contactErrorMessage: string | null = null;

  questionnaireForm: FormGroup = this.fb.group({
    symptomsDuration: [''],
    freeTextDescription: ['', [Validators.required, Validators.maxLength(this.maxDescriptionLength)]],
    consentToDataCollection: [false, Validators.requiredTrue]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly questionnaireService: QuestionnaireService
  ) {}

  ngOnInit(): void {
    this.loadPhq9Template();
  }

  private loadPhq9Template(): void {
    this.loadingTemplates.set(true);
    this.templateError.set('');

    this.questionnaireService
      .getAvailableTemplates()
      .pipe(finalize(() => this.loadingTemplates.set(false)))
      .subscribe({
        next: templates => {
          if (templates.length === 0) {
            this.templateError.set('Nenhum template de questionario disponivel no momento.');
            return;
          }

          const phqTemplate = templates.find(template =>
            this.normalizeType(template.type) === this.normalizeType(QuestionnaireScreenComponent.PHQ9_TEMPLATE_TYPE)
          );

          if (!phqTemplate) {
            this.templateError.set('Template PHQ-9 nao esta disponivel no momento.');
            return;
          }

          this.loadTemplateByType(phqTemplate.type);
        },
        error: () => {
          this.templateError.set('Nao foi possivel carregar o template PHQ-9. Tente novamente.');
        }
      });
  }

  private normalizeType(type: string): string {
    return type.trim().toLowerCase();
  }

  private loadTemplateByType(type: string): void {
    this.templateError.set('');

    this.questionnaireService.getTemplateByType(type).subscribe({
      next: template => {
        this.selectedTemplate.set(template);
        const questions = this.parseQuestions(template.questions);
        this.questions.set(questions);
        this.resetForm(questions);
      },
      error: () => {
        this.selectedTemplate.set(null);
        this.questions.set([]);
        this.resetForm([]);
        this.templateError.set('Nao foi possivel carregar o template selecionado.');
      }
    });
  }

  private resetForm(questions: QuestionItem[]): void {
    const controls: Record<string, FormControl<string | boolean | null>> = {
      symptomsDuration: new FormControl<string | null>(''),
      freeTextDescription: new FormControl<string | null>(
        '',
        [Validators.required, Validators.maxLength(this.maxDescriptionLength)]
      ),
      consentToDataCollection: new FormControl<boolean | null>(false, Validators.requiredTrue)
    };

    for (const question of questions) {
      const initialValue = question.type === QuestionType.CHECKBOX ? '' : '';
      controls[question.key] = new FormControl<string | null>(
        initialValue,
        question.required ? Validators.required : []
      );
    }

    this.questionnaireForm = this.fb.group({
      ...controls,
      consentToDataCollection: this.fb.control(false, Validators.requiredTrue)
    });
  }

  private parseQuestions(rawQuestions: string): QuestionItem[] {
    if (!rawQuestions) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawQuestions) as QuestionnaireQuestionsPayload | Record<string, string>;

      if (typeof parsed === 'object' && parsed !== null && 'questions' in parsed && Array.isArray(parsed.questions)) {
        return parsed.questions.map(question => ({
          key: question.key,
          text: question.text,
          type: this.normalizeQuestionType(question.type),
          required: question.required ?? true,
          options: Array.isArray(question.options) ? question.options : []
        }));
      }

      return Object.entries(parsed as Record<string, string>).map(([key, text], index) => ({
        key,
        text,
        type: QuestionType.MULTIPLE_CHOICE,
        required: true,
        options: this.buildDefaultPhqOptions(key, index)
      }));
    } catch {
      return [];
    }
  }

  private normalizeQuestionType(type: string | undefined): QuestionType {
    if (!type) {
      return QuestionType.MULTIPLE_CHOICE;
    }

    if (Object.values(QuestionType).includes(type as QuestionType)) {
      return type as QuestionType;
    }

    return QuestionType.MULTIPLE_CHOICE;
  }

  private buildDefaultPhqOptions(key: string, index: number) {
    const prefix = `${key}-o`;
    return [
      { id: `${prefix}0`, text: 'Nenhum dia', value: '0', order: 1 },
      { id: `${prefix}1`, text: 'Varios dias', value: '1', order: 2 },
      { id: `${prefix}2`, text: 'Mais da metade dos dias', value: '2', order: 3 },
      { id: `${prefix}3`, text: 'Quase todos os dias', value: '3', order: 4 }
    ];
  }

  onCheckboxChange(event: Event, questionKey: string): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    const checked = checkbox.checked;
    const control = this.questionnaireForm.get(questionKey);
    const currentValue = control?.value;
    const values = typeof currentValue === 'string' && currentValue.length > 0
      ? currentValue.split(',')
      : [];

    if (checked) {
      if (!values.includes(value)) {
        values.push(value);
      }
    } else {
      const index = values.indexOf(value);
      if (index >= 0) {
        values.splice(index, 1);
      }
    }

    control?.setValue(values.join(','));
    control?.markAsTouched();
  }

  onSingleChoiceCheckboxChange(event: Event, questionKey: string): void {
    const checkbox = event.target as HTMLInputElement;
    const control = this.questionnaireForm.get(questionKey);

    control?.setValue(checkbox.checked ? checkbox.value : '');
    control?.markAsTouched();
  }

  isOptionChecked(questionKey: string, value: string): boolean {
    const currentValue = this.questionnaireForm.get(questionKey)?.value;

    if (typeof currentValue !== 'string' || currentValue.length === 0) {
      return false;
    }

    return currentValue.split(',').includes(value);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.questionnaireForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isControlValid(controlName: string): boolean {
    const control = this.questionnaireForm.get(controlName);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  getDescriptionLength(): number {
    const value = this.questionnaireForm.get('freeTextDescription')?.value;
    return typeof value === 'string' ? value.length : 0;
  }

  onSubmit(template: QuestionnaireTemplate): void {
    this.submitError.set('');
    this.submissionResult.set(null);

    if (this.questionnaireForm.invalid) {
      this.questionnaireForm.markAllAsTouched();
      return;
    }

    const formValue = this.questionnaireForm.getRawValue() as Record<string, string | boolean>;
    const answers: Record<string, string> = {};

    const getStringValue = (key: string): string => {
      const value = formValue[key];
      return typeof value === 'string' ? value : '';
    };

    for (const question of this.questions()) {
      answers[question.key] = getStringValue(question.key);
    }

    const symptomsDuration = getStringValue('symptomsDuration');
    const freeTextDescription = getStringValue('freeTextDescription');

    this.submitting.set(true);

    this.questionnaireService
      .submitAnswers({
        type: template.type,
        answers: JSON.stringify(answers),
        symptomsDuration: symptomsDuration || undefined,
        freeTextDescription: freeTextDescription || undefined
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: response => {
          this.submissionResult.set(response);
        },
        error: () => {
          this.submitError.set('Falha ao enviar questionario. Verifique os dados e tente novamente.');
        }
      });
  }
}
