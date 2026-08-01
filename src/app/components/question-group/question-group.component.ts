import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { QuestionItem, QuestionType } from "@app/models/questionnaire.model";
import { RequiredSpanComponent } from "../required-span.component";
import { FieldErrorComponent } from "../field-error.component";
import { ChoiceQuestionComponent } from "./components/choice-question.component";
import { ScaleQuestionComponent } from "./components/scale-question.component";
import { TextQuestionComponent } from "./components/text-question.component";

@Component({
    selector: 'app-question-group',
    standalone: true,
    templateUrl: './question-group.component.html',
    styleUrl: './question-group.component.scss',
    imports: [CommonModule, FieldErrorComponent, RequiredSpanComponent, ChoiceQuestionComponent, ScaleQuestionComponent, TextQuestionComponent]
})
export class QuestionGroupComponent {
    readonly maxDescriptionLength = 1000;

    @Input() questions: QuestionItem[] = [];
    @Input() form!: FormGroup;

    @Output() checkboxChanged = new EventEmitter<{ event: Event; questionKey: string }>();
    @Output() singleChoiceCheckboxChanged = new EventEmitter<{ event: Event; questionKey: string }>();

    readonly QuestionType = QuestionType;

    emitCheckboxChange(event: Event, questionKey: string): void {
        this.checkboxChanged.emit({ event, questionKey });
    }

    emitSingleChoiceCheckboxChange(event: Event, questionKey: string): void {
        this.singleChoiceCheckboxChanged.emit({ event, questionKey });
    }

    isControlInvalid(controlName: string): boolean {
        const control = this.form.get(controlName);
        return !!control && control.invalid && (control.dirty || control.touched);
    }

    getErrorMessage(question: QuestionItem): string {
        if (question.key === 'freeTextDescription') {
            return 'Esse campo e obrigatorio.';
        }

        return 'Essa pergunta e obrigatoria.';
    }

    shouldShowDescriptionCounter(question: QuestionItem): boolean {
        return question.key === 'freeTextDescription';
    }

    getDescriptionLength(questionKey: string): number {
        const value = this.form.get(questionKey)?.value;
        return typeof value === 'string' ? value.length : 0;
    }

}