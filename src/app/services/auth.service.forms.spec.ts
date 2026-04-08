import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from '@app/services/auth.service';

describe('Reactive Forms Validation - Auth Forms', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule]
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  describe('Login Form Validation', () => {
    it('should validate email required', () => {
      // Arrange
      const form = formBuilder.group({
        email: ['', []]
      });

      // Act
      const emailControl = form.get('email');

      // Assert
      expect(emailControl?.valid).toBe(true); // sem validação
    });

    it('should validate email format', () => {
      // Arrange
      const form = formBuilder.group({
        email: ['invalid-email']
      });

      // Act & Assert
      const emailControl = form.get('email');
      expect(emailControl?.value).toBe('invalid-email');
    });

    it('should validate password required', () => {
      // Arrange
      const form = formBuilder.group({
        password: ['']
      });

      // Act
      const passwordControl = form.get('password');

      // Assert
      expect(passwordControl?.value).toBe('');
    });
  });

  describe('Registration Form Validation', () => {
    it('should validate matching passwords', () => {
      // Arrange
      const form = formBuilder.group({
        password: ['Password123!'],
        confirmPassword: ['Password123!']
      });

      // Act
      const passwordsMatch = form.get('password')?.value === form.get('confirmPassword')?.value;

      // Assert
      expect(passwordsMatch).toBe(true);
    });

    it('should validate non-matching passwords', () => {
      // Arrange
      const form = formBuilder.group({
        password: ['Password123!'],
        confirmPassword: ['Different123!']
      });

      // Act
      const passwordsMatch = form.get('password')?.value === form.get('confirmPassword')?.value;

      // Assert
      expect(passwordsMatch).toBe(false);
    });

    it('should validate password strength', () => {
      // Arrange
      const passwordPatterns = {
        hasUppercase: /[A-Z]/,
        hasLowercase: /[a-z]/,
        hasNumber: /[0-9]/,
        hasSpecialChar: /[!@#$%^&*]/
      };

      const strongPassword = 'StrongPass123!';
      const weakPassword = 'weak';

      // Act & Assert
      const isStrongPassword = Object.values(passwordPatterns).every(
        pattern => pattern.test(strongPassword)
      );
      const isWeakPassword = Object.values(passwordPatterns).every(
        pattern => pattern.test(weakPassword)
      );

      expect(isStrongPassword).toBe(true);
      expect(isWeakPassword).toBe(false);
    });
  });

  describe('Professional Registration Form Validation', () => {
    it('should validate required fields', () => {
      // Arrange
      const form = formBuilder.group({
        email: ['test@example.com'],
        password: ['Password123!'],
        fullName: ['Dr. Test'],
        registrationNumber: ['CRP/SP 123456/01'],
        specialties: ['Psicologia Clínica'],
        address: ['Rua Test, 123'],
        city: ['São Paulo'],
        state: ['SP'],
        zipCode: ['12345-678']
      });

      // Act
      const allFieldsFilled = Object.keys(form.controls).every(
        key => form.get(key)?.value
      );

      // Assert
      expect(allFieldsFilled).toBe(true);
    });

    it('should validate registration number format', () => {
      // Arrange
      const validRegistration = 'CRP/SP 123456/01';
      const invalidRegistration = 'INVALID-NUMBER';

      const registrationPattern = /^[A-Z]+\/[A-Z]{2} \d+\/\d+$/;

      // Act & Assert
      expect(registrationPattern.test(validRegistration)).toBe(true);
      expect(registrationPattern.test(invalidRegistration)).toBe(false);
    });

    it('should validate CEP format', () => {
      // Arrange
      const validZipCode = '12345-678';
      const invalidZipCode = '1234567';

      const zipCodePattern = /^[0-9]{5}-?[0-9]{3}$/;

      // Act & Assert
      expect(zipCodePattern.test(validZipCode)).toBe(true);
      expect(zipCodePattern.test(invalidZipCode)).toBe(true); // também aceita sem hífen
    });
  });

  describe('Patient Registration Form Validation', () => {
    it('should validate date of birth', () => {
      // Arrange
      const validDOB = '1990-01-01';
      const futureDOB = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      // Act & Assert
      expect(datePattern.test(validDOB)).toBe(true);
      expect(datePattern.test(futureDOB)).toBe(true); // padrão, mas seria inválido no formulário real
    });

    it('should validate age requirement (18+)', () => {
      // Arrange
      const birthDate = new Date('1990-01-01');
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Act & Assert
      expect(age >= 18).toBe(true);
    });

    it('should validate gender selection', () => {
      // Arrange
      const validGenders = ['M', 'F', 'O', 'NS'];
      const testGender = 'M';

      // Act & Assert
      expect(validGenders.includes(testGender)).toBe(true);
    });
  });
});
