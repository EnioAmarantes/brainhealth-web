import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionItem } from '@app/models/questionnaire.model';

@Component({
  selector: 'app-scale-question',
  standalone: true,
  templateUrl: './scale-question.component.html',
  styleUrl: './scale-question.component.scss',
  imports: [CommonModule, ReactiveFormsModule]
})
export class ScaleQuestionComponent {
  @Input({ required: true }) question!: QuestionItem;
  @Input({ required: true }) form!: FormGroup;

  getImpactEmoji(value: string): string {
    return {
      '1': '😌',
      '2': '🙂',
      '3': '😐',
      '4': '😟',
      '5': '😣'
    }[value] ?? value;
  }

  getScaleProgress(questionKey: string): number | null {
    const rawValue = this.form.get(questionKey)?.value;
    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 5) {
      return null;
    }

    return ((numericValue - 1) / 4) * 100;
  }
}
