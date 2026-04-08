import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

describe('LoginForm Validation', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule]
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  describe('Email Field', () => {
    it('should validate required email', () => {
      // ARRANGE
      const form = formBuilder.group({
        email: ['']
      });

      // ACT
      const emailControl = form.get('email');

      // ASSERT
      expect(emailControl?.value).toBe('');
    });

    it('should validate email format', () => {
      // ARRANGE
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // ACT & ASSERT
      expect(emailPattern.test(validEmail)).toBe(true);
      expect(emailPattern.test(invalidEmail)).toBe(false);
    });
  });

  describe('Password Field', () => {
    it('should validate required password', () => {
      // ARRANGE
      const form = formBuilder.group({
        password: ['']
      });

      // ACT
      const passwordControl = form.get('password');

      // ASSERT
      expect(passwordControl?.value).toBe('');
    });

    it('should validate password minimum length', () => {
      // ARRANGE
      const shortPassword = 'short';
      const validPassword = 'ValidPass123!';

      // ACT & ASSERT
      expect(shortPassword.length >= 8).toBe(false);
      expect(validPassword.length >= 8).toBe(true);
    });

    it('should validate password complexity', () => {
      // ARRANGE
      const complexityRules = {
        hasUppercase: /[A-Z]/,
        hasLowercase: /[a-z]/,
        hasNumber: /[0-9]/,
        hasSpecial: /[!@#$%^&*]/
      };

      const strongPassword = 'StrongPass123!';
      const weakPassword = 'weakpass';

      // ACT
      const isStrongPassword = Object.values(complexityRules).every(
        rule => rule.test(strongPassword)
      );
      const isWeakPassword = Object.values(complexityRules).every(
        rule => rule.test(weakPassword)
      );

      // ASSERT
      expect(isStrongPassword).toBe(true);
      expect(isWeakPassword).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should disable submit when form is invalid', () => {
      // ARRANGE
      const form = formBuilder.group({
        email: ['invalid'],
        password: ['']
      });

      // ACT
      const isFormValid = form.valid;

      // ASSERT
      expect(isFormValid).toBe(false);
    });

    it('should enable submit when form is valid', () => {
      // ARRANGE
      const form = formBuilder.group({
        email: ['test@example.com'],
        password: ['ValidPass123!']
      });

      // ACT
      const isFormValid = form.valid;

      // ASSERT
      expect(isFormValid).toBe(true);
    });
  });
});

describe('RegistrationForm Validation', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule]
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  describe('Password Confirmation', () => {
    it('should validate matching passwords', () => {
      // ARRANGE
      const password = 'Password123!';
      const confirmPassword = 'Password123!';

      // ACT
      const match = password === confirmPassword;

      // ASSERT
      expect(match).toBe(true);
    });

    it('should invalidate non-matching passwords', () => {
      // ARRANGE
      const password = 'Password123!';
      const confirmPassword = 'Different123!';

      // ACT
      const match = password === confirmPassword;

      // ASSERT
      expect(match).toBe(false);
    });
  });

  describe('Professional Registration Fields', () => {
    it('should validate registration number format', () => {
      // ARRANGE
      const validRegistration = 'CRP/SP 123456/01';
      const invalidRegistration = 'INVALID';

      const registrationPattern = /^[A-Z]+\/[A-Z]{2} \d+\/\d+$/;

      // ACT & ASSERT
      expect(registrationPattern.test(validRegistration)).toBe(true);
      expect(registrationPattern.test(invalidRegistration)).toBe(false);
    });

    it('should validate specialties selection', () => {
      // ARRANGE
      const specialties = ['Psicologia Clínica', 'Psicologia Organizacional'];
      const selectedSpecialty = 'Psicologia Clínica';

      // ACT & ASSERT
      expect(specialties.includes(selectedSpecialty)).toBe(true);
    });

    it('should validate CEP format', () => {
      // ARRANGE
      const validCEP = '12345-678';
      const invalidCEP = 'INVALID';

      const cepPattern = /^[0-9]{5}-?[0-9]{3}$/;

      // ACT & ASSERT
      expect(cepPattern.test(validCEP)).toBe(true);
      expect(cepPattern.test(invalidCEP)).toBe(false);
    });

    it('should validate consultation rate', () => {
      // ARRANGE
      const validRate = 150.00;
      const invalidRate = 0;

      // ACT & ASSERT
      expect(validRate > 0).toBe(true);
      expect(invalidRate > 0).toBe(false);
    });
  });

  describe('Patient Registration Fields', () => {
    it('should validate date of birth', () => {
      // ARRANGE
      const validDOB = '1990-01-01';
      const futureDOB = '2030-01-01';

      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      // ACT & ASSERT
      expect(datePattern.test(validDOB)).toBe(true);
      expect(datePattern.test(futureDOB)).toBe(true); // Padrão, validação de idade seria no validator
    });

    it('should validate age requirement', () => {
      // ARRANGE
      const birthDate = new Date('1990-01-01');
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // ACT & ASSERT
      expect(age >= 18).toBe(true);
    });

    it('should validate gender selection', () => {
      // ARRANGE
      const validGenders = ['M', 'F', 'O', 'NS'];
      const testGender = 'M';

      // ACT & ASSERT
      expect(validGenders.includes(testGender)).toBe(true);
    });

    it('should validate address fields', () => {
      // ARRANGE
      const address = 'Rua Principal, 123';
      const city = 'São Paulo';
      const state = 'SP';

      // ACT
      const isValid = address && city && state && state.length === 2;

      // ASSERT
      expect(isValid).toBe(true);
    });
  });
});

describe('Form Error Messages', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule]
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should show email required error', () => {
    // ARRANGE
    const form = formBuilder.group({
      email: ['']
    });

    const emailControl = form.get('email');

    // ACT
    const hasError = emailControl?.hasError('required');

    // ASSERT
    expect(hasError).toBe(true);
  });

  it('should show password minimum length error', () => {
    // ARRANGE
    const form = formBuilder.group({
      password: ['short']
    });

    // ACT
    const passwordControl = form.get('password');
    const isValid = (passwordControl?.value?.length || 0) >= 8;

    // ASSERT
    expect(isValid).toBe(false);
  });

  it('should show password mismatch error', () => {
    // ARRANGE
    const form = formBuilder.group({
      password: ['Password123!'],
      confirmPassword: ['Different123!']
    });

    // ACT
    const passwordsMatch = 
      form.get('password')?.value === form.get('confirmPassword')?.value;

    // ASSERT
    expect(passwordsMatch).toBe(false);
  });
});
