import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';

/**
 * Validador para CRP - formato: CRP-SP-123456
 * Exemplo válido: CRP-SP-123456, CRP-RJ-999999
 */
export function crpValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Válido se vazio (é opcional)
    }

    // Formato: CRP-UF-NÚMEROS (ex: CRP-SP-123456)
    const crpRegex = /^CRP-[A-Z]{2}-\d{6}$/;

    if (!crpRegex.test(control.value.toUpperCase())) {
      return { invalidCRP: { value: control.value } };
    }

    return null;
  };
}

/**
 * Validador para garantir mínimo de itens em FormArray
 * Uso: new FormArray([], minArrayLength(1))
 */
export function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      if (control.length < min) {
        return { minArrayLength: { requiredLength: min, actualLength: control.length } };
      }
    }
    return null;
  };
}

/**
 * Validador para garantir que o horário de término seja após o início
 * Uso: FormGroup com validators: timeRangeValidator()
 */
export function timeRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;

    if (!group) {
      return null;
    }

    const startTime = group.get('startTime')?.value;
    const endTime = group.get('endTime')?.value;

    if (!startTime || !endTime) {
      return null;
    }

    // Converte horários HH:mm para minutos para comparação
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes <= startTotalMinutes) {
      return { invalidTimeRange: true };
    }

    return null;
  };
}

/**
 * Validador para verificar se a especialidade já foi adicionada (evita duplicatas)
 * Uso: FormArray com asyncValidators
 */
export function noDuplicateSpecialties(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      const values = control.value.filter((v: any) => v); // Remove valores vazios
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        return { duplicateSpecialties: true };
      }
    }
    return null;
  };
}

/**
 * Validador para garantir que pelo menos um dia da semana foi selecionado
 * Usa minArrayLength internamente
 */
export function minDaysSelected(min: number = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      if (control.length < min) {
        return { minDaysSelected: { requiredDays: min, selectedDays: control.length } };
      }
    }
    return null;
  };
}

/**
 * Validador para experiência - máximo realista
 */
export function maxExperience(max: number = 70): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = Number(control.value);

    if (value > max) {
      return { maxExperience: { max, actualValue: value } };
    }

    return null;
  };
}

/**
 * Validador para preço de consulta - garante que seja um valor válido
 */
export function validConsultationPrice(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value && control.value !== 0) {
      return null;
    }

    const value = Number(control.value);

    // Deve ser um número positivo
    if (isNaN(value) || value < 0) {
      return { invalidPrice: { value: control.value } };
    }

    // Máximo razoável (ex: 10.000 reais)
    if (value > 10000) {
      return { priceOutOfRange: { max: 10000, value } };
    }

    return null;
  };
}

/**
 * Validador para CEP - formato brasileiro
 */
export function brazilianCepValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    // Aceita formatos: 12345-678 ou 12345678
    const cepRegex = /^\d{5}-?\d{3}$/;

    if (!cepRegex.test(control.value)) {
      return { invalidCep: { value: control.value } };
    }

    return null;
  };
}

/**
 * Validador para email corporativo/profissional (opcional)
 * Rejeita emails muito comuns (gmail, hotmail, etc se necessário)
 */
export function professionalEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value.toLowerCase();

    // Validação básica de email já é feita pelo Validators.email
    // Este validador pode adicionar regras adicionais se necessário
    const freeEmailDomains = [
      'gmail.com',
      'hotmail.com',
      'yahoo.com',
      'outlook.com',
    ];

    if (freeEmailDomains.some((domain) => email.endsWith(domain))) {
      // Comentar esta validação se quiser permitir emails pessoais
      // return { freemailDomain: { domain: email.split('@')[1] } };
    }

    return null;
  };
}

/**
 * Validador para descrição - garante conteúdo significativo
 */
export function meaningfulDescription(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = (control.value as string).trim();

    // Mínimo de 20 caracteres já é validado por minlength
    // Este validador pode adicionar validações de conteúdo

    // Exemplo: rejeita se é apenas números ou caracteres repetidos
    const hasLetters = /[a-áàâäãéèêëíìîïóòôöõúùûüç]/i.test(value);

    if (!hasLetters) {
      return { noMeaningfulContent: true };
    }

    return null;
  };
}

/**
 * Validador para Estado (UF) - apenas estados brasileiros válidos
 */
export function brazilianStateValidator(): ValidatorFn {
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const state = (control.value as string).toUpperCase();

    if (!validStates.includes(state)) {
      return { invalidState: { value: control.value, validStates } };
    }

    return null;
  };
}

/**
 * Validador assíncrono para verificar se o email já existe no sistema
 * (Seria implementado com um serviço HTTP)
 */
// export function emailExistsValidator(professionalService: ProfessionalService): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     if (!control.value) {
//       return of(null);
//     }
//
//     return professionalService.checkEmailExists(control.value).pipe(
//       map((exists: boolean) => (exists ? { emailExists: true } : null)),
//       catchError(() => of(null))
//     );
//   };
// }
