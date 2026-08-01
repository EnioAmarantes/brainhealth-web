import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionItem, QuestionType } from '@app/models/questionnaire.model';
import { CheckboxComponent } from '@app/components/checkbox.component';
import { MultiChoiceOptionStrategy } from '../strategies/multi-choice-option.strategy';
import { OptionStrategy } from '../strategies/option-strategy';
import { SingleChoiceOptionStrategy } from '../strategies/single-choice-option.strategy';

@Component({
  selector: 'app-choice-question',
  standalone: true,
  templateUrl: './choice-question.component.html',
  styleUrl: './choice-question.component.scss',
  imports: [CommonModule, ReactiveFormsModule, CheckboxComponent]
})
export class ChoiceQuestionComponent {
  @Input({ required: true }) question!: QuestionItem;
  @Input({ required: true }) form!: FormGroup;

  @Output() checkboxChanged = new EventEmitter<Event>();
  @Output() singleChoiceCheckboxChanged = new EventEmitter<Event>();

  readonly QuestionType = QuestionType;

  private readonly singleChoiceStrategy: OptionStrategy = new SingleChoiceOptionStrategy();
  private readonly multiChoiceStrategy: OptionStrategy = new MultiChoiceOptionStrategy();

  onOptionChange(event: Event): void {
    const action = this.getOptionStrategy(this.question.type).handleChange(event, this.question.key);

    if (action.mode === 'multi') {
      this.checkboxChanged.emit(action.event);
      return;
    }

    this.singleChoiceCheckboxChanged.emit(action.event);
  }

  isOptionChecked(value: string): boolean {
    return this.getOptionStrategy(this.question.type).isChecked(this.form, this.question.key, value);
  }

  private getOptionStrategy(type: QuestionType): OptionStrategy {
    return type === QuestionType.CHECKBOX
      ? this.multiChoiceStrategy
      : this.singleChoiceStrategy;
  }
}
