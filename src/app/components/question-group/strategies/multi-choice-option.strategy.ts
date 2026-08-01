import { FormGroup } from '@angular/forms';
import { OptionChangeAction, OptionStrategy } from './option-strategy';

export class MultiChoiceOptionStrategy implements OptionStrategy {
  isChecked(form: FormGroup, questionKey: string, value: string): boolean {
    const currentValue = form.get(questionKey)?.value;

    if (typeof currentValue !== 'string' || currentValue.length === 0) {
      return false;
    }

    return currentValue.split(',').includes(value);
  }

  handleChange(event: Event, questionKey: string): OptionChangeAction {
    return {
      mode: 'multi',
      event,
      questionKey
    };
  }
}
