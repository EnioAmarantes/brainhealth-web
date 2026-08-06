import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-field-error',
    standalone: true,
    template: `
        @if(isErrorVisible) {
                        <p
                            class="field-error"
                            role="alert"
                            aria-live="assertive"
                            [attr.id]="errorId || null"
                        >
                            {{ errorMessage }}
                        </p>
        }
    `,
    styles: [`
        .field-error {
                        color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
    `]
})
export class FieldErrorComponent {
    @Input() isErrorVisible: boolean = false;
    @Input() errorMessage: string = '';
    @Input() errorId: string = '';
}