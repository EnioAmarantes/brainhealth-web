import { FormGroup } from '@angular/forms';
import { OptionChangeAction, OptionStrategy } from './option-strategy';

export class SingleChoiceOptionStrategy implements OptionStrategy {
  isChecked(form: FormGroup, questionKey: string, value: string): boolean {
    const currentValue = form.get(questionKey)?.value;
    return typeof currentValue === 'string' && currentValue === value;
  }

  handleChange(event: Event, questionKey: string): OptionChangeAction {
    return {
      mode: 'single',
      event,
      questionKey
    };
  }
}
