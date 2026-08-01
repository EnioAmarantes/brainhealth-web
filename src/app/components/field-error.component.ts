import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-field-error',
    standalone: true,
    template: `
        @if(isErrorVisible) {
            <p class="field-error">{{ errorMessage }}</p>
        }
    `,
    styles: [`
        .field-error {
            color: red;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
    `]
})
export class FieldErrorComponent {
    @Input() isErrorVisible: boolean = false;
    @Input() errorMessage: string = '';
}