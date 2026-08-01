import { FormGroup } from '@angular/forms';

export type OptionChangeMode = 'single' | 'multi';

export interface OptionChangeAction {
  mode: OptionChangeMode;
  event: Event;
  questionKey: string;
}

export interface OptionStrategy {
  isChecked(form: FormGroup, questionKey: string, value: string): boolean;
  handleChange(event: Event, questionKey: string): OptionChangeAction;
}
