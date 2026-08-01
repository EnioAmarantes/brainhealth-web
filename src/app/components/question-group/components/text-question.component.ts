import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionItem } from '@app/models/questionnaire.model';

@Component({
  selector: 'app-text-question',
  standalone: true,
  templateUrl: './text-question.component.html',
  styleUrl: './text-question.component.scss',
  imports: [ReactiveFormsModule]
})
export class TextQuestionComponent {
  @Input({ required: true }) question!: QuestionItem;
  @Input({ required: true }) form!: FormGroup;

  isControlInvalid(): boolean {
    const control = this.form.get(this.question.key);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isControlValid(): boolean {
    const control = this.form.get(this.question.key);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  getPlaceholder(): string {
    if (this.question.key === 'freeTextDescription') {
      return 'Descreva com suas palavras o que esta sentindo...';
    }

    return 'Sua resposta aqui...';
  }

  getRows(): number {
    return this.question.key === 'freeTextDescription' ? 5 : 4;
  }
}
