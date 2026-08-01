import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  QuestionType,
  QuestionnaireAnswerResponse,
  QuestionnaireTemplate,
  QuestionItem,
  QuestionOption,
  BackendQuestionnaireQuestionsPayload,
  RecommendedProfessionalsResponse
} from '@app/models/questionnaire.model';
import { QuestionnaireService } from '@app/services/questionnaire.service';
import { AiAnalysisService } from '@app/services/ai-analysis.service';
import { FieldErrorComponent } from "@app/components/field-error.component";
import { QuestionGroupComponent } from "@app/components/question-group/question-group.component";

@Component({
  selector: 'app-questionnaire-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldErrorComponent, QuestionGroupComponent],
  templateUrl: './questionnaire-screen.component.html',
  styleUrl: './questionnaire-screeen.component.scss'
})
export class QuestionnaireScreenComponent implements OnInit {
  private static readonly PHQ9_TEMPLATE_TYPE = 'PHQ-9';
  readonly maxDescriptionLength = 1000;

  readonly selectedTemplate = signal<QuestionnaireTemplate | null>(null);
  readonly questions = signal<QuestionItem[]>([]);
  readonly loadingTemplates = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly templateError = signal<string>('');
  readonly submitError = signal<string>('');
  readonly submissionResult = signal<QuestionnaireAnswerResponse | null>(null);
  readonly aiRecommendation = signal<RecommendedProfessionalsResponse | null>(null);
  readonly aiRecommendationLoading = signal<boolean>(false);
  readonly aiRecommendationError = signal<string>('');

  questionnaireForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    consentToDataCollection: [false, Validators.requiredTrue]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly questionnaireService: QuestionnaireService,
    private readonly aiAnalysisService: AiAnalysisService
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
      fullName: new FormControl<string | null>('', [Validators.required, Validators.maxLength(150)]),
      phoneNumber: new FormControl<string | null>('', [Validators.required, Validators.maxLength(30)]),
      consentToDataCollection: new FormControl<boolean | null>(false, Validators.requiredTrue)
    };

    for (const question of questions) {
      const validators = question.required ? [Validators.required] : [];

      if (question.key === 'freeTextDescription') {
        validators.push(Validators.maxLength(this.maxDescriptionLength));
      }

      controls[question.key] = new FormControl<string | null>(
        '',
        validators
      );
    }

    this.questionnaireForm = this.fb.group({
      ...controls,
      consentToDataCollection: this.fb.control(false, Validators.requiredTrue)
    });
  }

  private parseQuestions(rawQuestions: QuestionnaireTemplate['questions']): QuestionItem[] {
    if (!rawQuestions) {
      return [];
    }

    try {
      const parsed = typeof rawQuestions === 'string'
        ? JSON.parse(rawQuestions) as BackendQuestionnaireQuestionsPayload
        : rawQuestions;

      const normalizedQuestions = this.extractQuestionsArray(parsed);

      return normalizedQuestions
        .slice()
        .sort((left, right) => this.extractQuestionOrder(left as { order?: unknown }) - this.extractQuestionOrder(right as { order?: unknown }))
        .map(question => {
          const rawQuestion = question as {
            key?: unknown;
            code?: unknown;
            text?: unknown;
            type?: unknown;
            required?: unknown;
            options?: unknown;
          };
          const mappedKey = this.extractQuestionKey(rawQuestion);

          return {
            key: mappedKey,
            text: typeof rawQuestion.text === 'string' ? rawQuestion.text : '',
            type: this.normalizeQuestionType(typeof rawQuestion.type === 'string' ? rawQuestion.type : undefined),
            required: rawQuestion.required !== false,
            options: this.normalizeOptions(rawQuestion.options)
          };
        })
        .filter(question => question.key.length > 0 && question.text.length > 0);
    } catch {
      return [];
    }
  }

  private extractQuestionsArray(parsed: unknown): unknown[] {
    if (!parsed || typeof parsed !== 'object') {
      return [];
    }

    const directQuestions = (parsed as { questions?: unknown }).questions;

    if (Array.isArray(directQuestions)) {
      return directQuestions;
    }

    if (directQuestions && typeof directQuestions === 'object') {
      const nestedQuestions = (directQuestions as { questions?: unknown }).questions;

      if (Array.isArray(nestedQuestions)) {
        return nestedQuestions;
      }
    }

    return [];
  }

  private extractQuestionKey(question: { key?: unknown; code?: unknown }): string {
    if (typeof question.key === 'string' && question.key.trim().length > 0) {
      return question.key;
    }

    if (typeof question.code === 'string' && question.code.trim().length > 0) {
      return question.code;
    }

    return '';
  }

  private extractQuestionOrder(question: { order?: unknown }): number {
    const order = question.order;
    return typeof order === 'number' ? order : Number.MAX_SAFE_INTEGER;
  }

  private normalizeOptions(options: unknown): QuestionOption[] {
    if (!Array.isArray(options)) {
      return [];
    }

    const normalizedOptions: QuestionOption[] = [];

    for (const option of options) {
      if (!option || typeof option !== 'object') {
        continue;
      }

      const rawOption = option as Partial<QuestionOption> & { code?: string };
      const id = typeof rawOption.id === 'string'
        ? rawOption.id
        : (typeof rawOption.code === 'string' ? rawOption.code : '');

      if (id.length === 0) {
        continue;
      }

      normalizedOptions.push({
        id,
        code: typeof rawOption.code === 'string' ? rawOption.code : undefined,
        text: typeof rawOption.text === 'string' ? rawOption.text : '',
        value: typeof rawOption.value === 'string' ? rawOption.value : '',
        order: typeof rawOption.order === 'number' ? rawOption.order : Number.MAX_SAFE_INTEGER
      });
    }

    return normalizedOptions.sort((left, right) => left.order - right.order);
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

  onSubmit(template: QuestionnaireTemplate): void {
    this.submitError.set('');
    this.submissionResult.set(null);
    this.aiRecommendation.set(null);
    this.aiRecommendationError.set('');

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

    const symptomsDuration = getStringValue('q3');
    const freeTextDescription = getStringValue('freeTextDescription');
    const fullName = getStringValue('fullName').trim();
    const phoneNumber = getStringValue('phoneNumber').trim();
    const browserContext = this.getBrowserContext();

    this.submitting.set(true);

    this.questionnaireService
      .submitAnswers({
        type: template.type,
        answers: JSON.stringify(answers),
        fullName,
        phoneNumber,
        operatingSystem: browserContext.operatingSystem,
        deviceType: browserContext.deviceType,
        browserName: browserContext.browserName,
        symptomsDuration: symptomsDuration || undefined,
        freeTextDescription: freeTextDescription || undefined
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: response => {
          this.submissionResult.set(response);
          this.runAiRecommendation(freeTextDescription, response);
        },
        error: () => {
          this.submitError.set('Falha ao enviar questionario. Verifique os dados e tente novamente.');
        }
      });
  }

  private runAiRecommendation(description: string, result: QuestionnaireAnswerResponse): void {
    const cleanDescription = description.trim();

    if (cleanDescription.length === 0) {
      this.aiRecommendationError.set('Preencha a descricao do problema para receber recomendacao de profissionais.');
      return;
    }

    const contextParts = [
      `Tipo: ${result.type}`,
      `Pontuacao: ${result.totalScore ?? '-'}`,
      `Classificacao: ${result.result ?? '-'}`,
      `Recomendacao base: ${result.recommendations ?? '-'}`
    ];

    this.aiRecommendationLoading.set(true);

    this.aiAnalysisService
      .analyzeAndRecommend({
        patientDescription: cleanDescription,
        previousContext: contextParts.join(' | ')
      })
      .pipe(finalize(() => this.aiRecommendationLoading.set(false)))
      .subscribe({
        next: response => {
          this.aiRecommendation.set(response);
        },
        error: () => {
          this.aiRecommendationError.set('Nao foi possivel carregar a recomendacao de profissionais neste momento.');
        }
      });
  }

  private getBrowserContext(): { operatingSystem: string; deviceType: string; browserName: string } {
    const userAgent = navigator.userAgent || '';
    const lowerUserAgent = userAgent.toLowerCase();

    return {
      operatingSystem: this.detectOperatingSystem(userAgent),
      deviceType: this.detectDeviceType(lowerUserAgent),
      browserName: this.detectBrowserName(userAgent)
    };
  }

  private detectOperatingSystem(userAgent: string): string {
    if (/Windows NT/i.test(userAgent)) {
      return 'Windows';
    }

    if (/Mac OS X|Macintosh/i.test(userAgent)) {
      return 'macOS';
    }

    if (/Android/i.test(userAgent)) {
      return 'Android';
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'iOS';
    }

    if (/Linux/i.test(userAgent)) {
      return 'Linux';
    }

    return 'Unknown';
  }

  private detectDeviceType(lowerUserAgent: string): string {
    if (/ipad|tablet|playbook|silk/i.test(lowerUserAgent)) {
      return 'tablet';
    }

    if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(lowerUserAgent)) {
      return 'mobile';
    }

    return 'desktop';
  }

  private detectBrowserName(userAgent: string): string {
    if (/Edg\//i.test(userAgent)) {
      return 'Edge';
    }

    if (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent)) {
      return 'Opera';
    }

    if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent) && !/OPR\//i.test(userAgent)) {
      return 'Chrome';
    }

    if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
      return 'Safari';
    }

    if (/Firefox\//i.test(userAgent)) {
      return 'Firefox';
    }

    if (/MSIE|Trident\//i.test(userAgent)) {
      return 'Internet Explorer';
    }

    return 'Unknown';
  }
}
