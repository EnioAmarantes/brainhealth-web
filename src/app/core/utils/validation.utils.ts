import { VALIDATION_PATTERNS } from '../constants/validation.constants';

/**
 * Utilitários para validação
 */
export class ValidationUtils {
  /**
   * Valida email
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }

  /**
   * Valida telefone
   */
  static isValidPhone(phone: string): boolean {
    return VALIDATION_PATTERNS.PHONE.test(phone);
  }

  /**
   * Valida CPF
   */
  static isValidCPF(cpf: string): boolean {
    return VALIDATION_PATTERNS.CPF.test(cpf);
  }

  /**
   * Valida força de senha
   */
  static isStrongPassword(password: string): boolean {
    return VALIDATION_PATTERNS.PASSWORD_STRONG.test(password);
  }

  /**
   * Verifica comprimento mínimo
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return value.length >= minLength;
  }

  /**
   * Verifica comprimento máximo
   */
  static hasMaxLength(value: string, maxLength: number): boolean {
    return value.length <= maxLength;
  }
}
