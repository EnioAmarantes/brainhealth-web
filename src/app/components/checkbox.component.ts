import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionItem } from '@app/models/questionnaire.model';

@Component({
    selector: 'app-checkbox',
    template: `
        <div
            class="checkboxes"
            [class.compact-options]="item?.key === 'q2'"
            [class.q2-two-lines]="item?.key === 'q2'"
            [style.display]="item?.key === 'q2' ? 'grid' : null"
            [style.grid-template-columns]="item?.key === 'q2' ? 'repeat(3, minmax(0, 1fr))' : null">
            @for (option of item?.options; track option.id) {
                <div class="checkbox-item">
                    <input
                        type="checkbox"
                        [id]="option.id"
                        (change)="onChange($event)"
                        [value]="option.value"
                        [attr.aria-label]="option.text"
                    />
                    <label [for]="option.id">{{ option.text }}</label>
                </div>
            }
        </div>
    `,
    styles: [`
        .checkboxes {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .compact-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 10px 16px;
        }

        .q2-two-lines {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px 16px;
        }

        .q2-two-lines .checkbox-item {
            align-items: flex-start;
        }

        .q2-two-lines .checkbox-item label {
            line-height: 1.25;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .checkbox-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        .checkbox-item label {
            margin: 0;
            font-size: 16px;
            font-weight: 400;
            cursor: pointer;
            line-height: 1.4;
        }

        @media (max-width: 1024px) {
            .compact-options {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 8px 12px;
            }

            .q2-two-lines {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 768px) {
            .compact-options {
                gap: 8px 12px;
            }
        }

        @media (max-width: 520px) {
            .compact-options {
                grid-template-columns: 1fr;
            }

            .q2-two-lines {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class CheckboxComponent {
    @Input() item: QuestionItem | null = null;
    @Output() checkboxChange = new EventEmitter<Event>();

    onChange(event: Event): void {
        this.checkboxChange.emit(event);
    }
}