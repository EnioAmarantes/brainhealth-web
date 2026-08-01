import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-required-span',
    standalone: true,
    template: `
        @if(required) {
            <span class="required">*</span>
        }
    `,
    styles: [`
        .required {
            color: red;
        }
    `]
})

export class RequiredSpanComponent {
    @Input() required: boolean = true;
}
