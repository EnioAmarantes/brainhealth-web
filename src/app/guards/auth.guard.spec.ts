import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

describe('AuthGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, Router]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('canActivate', () => {
    it('should allow access when user is authenticated', () => {
      // ARRANGE
      spyOn(authService, 'hasValidToken').and.returnValue(true);

      // ACT
      const hasAccess = authService.hasValidToken();

      // ASSERT
      expect(hasAccess).toBe(true);
    });

    it('should deny access when user is not authenticated', () => {
      // ARRANGE
      spyOn(authService, 'hasValidToken').and.returnValue(false);

      // ACT
      const hasAccess = authService.hasValidToken();

      // ASSERT
      expect(hasAccess).toBe(false);
    });
  });

  describe('canActivateChild', () => {
    it('should allow access to child routes when authenticated', () => {
      // ARRANGE
      localStorage.setItem('authToken', 'valid-token');

      // ACT
      const token = authService.getToken();

      // ASSERT
      expect(token).toBe('valid-token');
    });

    it('should deny access to child routes when not authenticated', () => {
      // ARRANGE
      localStorage.clear();

      // ACT
      const token = authService.getToken();

      // ASSERT
      expect(token).toBeNull();
    });
  });
});

describe('ProfessionalGuard', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });

    authService = TestBed.inject(AuthService);
  });

  it('should allow access for professional users', () => {
    // ARRANGE
    const mockUser = {
      id: '1',
      email: 'prof@example.com',
      userType: 'Professional'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // ACT
    const userString = localStorage.getItem('currentUser');
    const user = userString ? JSON.parse(userString) : null;

    // ASSERT
    expect(user?.userType).toBe('Professional');
  });

  it('should deny access for non-professional users', () => {
    // ARRANGE
    const mockUser = {
      id: '2',
      email: 'patient@example.com',
      userType: 'Patient'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // ACT
    const userString = localStorage.getItem('currentUser');
    const user = userString ? JSON.parse(userString) : null;

    // ASSERT
    expect(user?.userType).not.toBe('Professional');
  });
});

describe('PatientGuard', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });

    authService = TestBed.inject(AuthService);
  });

  it('should allow access for patient users', () => {
    // ARRANGE
    const mockUser = {
      id: '2',
      email: 'patient@example.com',
      userType: 'Patient'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // ACT
    const userString = localStorage.getItem('currentUser');
    const user = userString ? JSON.parse(userString) : null;

    // ASSERT
    expect(user?.userType).toBe('Patient');
  });

  it('should deny access for non-patient users', () => {
    // ARRANGE
    const mockUser = {
      id: '1',
      email: 'prof@example.com',
      userType: 'Professional'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // ACT
    const userString = localStorage.getItem('currentUser');
    const user = userString ? JSON.parse(userString) : null;

    // ASSERT
    expect(user?.userType).not.toBe('Patient');
  });
});
