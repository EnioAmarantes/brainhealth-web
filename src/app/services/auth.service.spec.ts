import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginCredentials, LoginResponse, User, UserType } from '@app/models/auth.model';
import { environment } from '@environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockLoginResponse: LoginResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
    user: {
      id: '123',
      email: 'test@example.com',
      fullName: 'Test User',
      userType: UserType.PATIENT,
      emailConfirmed: true
    }
  };

  const mockCredentials: LoginCredentials = {
    email: 'test@example.com',
    password: 'Password123!'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loginPatient', () => {
    it('should login patient and store tokens', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/login/patient`;

      // Act
      service.loginPatient(mockCredentials).subscribe((response) => {
        // Assert
        expect(response.accessToken).toBe('mock-access-token');
        expect(response.user.email).toBe('test@example.com');
        expect(localStorage.getItem('authToken')).toBe('mock-access-token');
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      
      req.flush(mockLoginResponse);
    });

    it('should emit current user after login', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/login/patient`;

      // Act & Assert
      service.currentUser$.subscribe((user) => {
        if (user) {
          expect(user.email).toBe('test@example.com');
          done();
        }
      });

      service.loginPatient(mockCredentials).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      req.flush(mockLoginResponse);
    });

    it('should handle login error', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/login/patient`;
      const errorMessage = 'Invalid credentials';

      // Act & Assert
      service.loginPatient(mockCredentials).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(expectedUrl);
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('loginProfessional', () => {
    it('should login professional and store tokens', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/login/professional`;
      const professionalResponse: LoginResponse = {
        ...mockLoginResponse,
        user: { ...mockLoginResponse.user, userType: UserType.PROFESSIONAL }
      };

      // Act
      service.loginProfessional(mockCredentials).subscribe((response) => {
        // Assert
        expect(response.user.userType).toBe(UserType.PROFESSIONAL);
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(professionalResponse);
    });
  });

  describe('logout', () => {
    it('should clear tokens and user from storage', () => {
      // Arrange
      localStorage.setItem('authToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      localStorage.setItem('currentUser', JSON.stringify(mockLoginResponse.user));

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should emit null user after logout', (done) => {
      // Act & Assert
      service.currentUser$.subscribe((user) => {
        if (user === null) {
          expect(user).toBeNull();
          done();
        }
      });

      service.logout();
    });
  });

  describe('registerPatient', () => {
    it('should register patient and store tokens', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/register/patient`;
      const registrationData = {
        email: 'newpatient@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'New Patient',
        dateOfBirth: '1990-01-01'
      };

      // Act
      service.registerPatient(registrationData).subscribe((response) => {
        // Assert
        expect(response.accessToken).toBeTruthy();
        expect(response.user.email).toBe('newpatient@example.com');
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ ...mockLoginResponse, user: { ...mockLoginResponse.user, email: registrationData.email } });
    });
  });

  describe('registerProfessional', () => {
    it('should register professional and store tokens', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/register/professional`;
      const registrationData = {
        email: 'newprof@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Dr. Professional',
        registrationNumber: 'CRP/SP 123456/01'
      };

      // Act
      service.registerProfessional(registrationData).subscribe((response) => {
        // Assert
        expect(response.user.userType).toBe(UserType.PROFESSIONAL);
        done();
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush({
        ...mockLoginResponse,
        user: { ...mockLoginResponse.user, email: registrationData.email, userType: UserType.PROFESSIONAL }
      });
    });
  });

  describe('hasValidToken', () => {
    it('should return true when token exists', () => {
      // Arrange
      localStorage.setItem('authToken', 'valid-token');

      // Act
      const isValid = service.hasValidToken();

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false when token does not exist', () => {
      // Act
      const isValid = service.hasValidToken();

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from storage', () => {
      // Arrange
      const token = 'test-token';
      localStorage.setItem('authToken', token);

      // Act
      const retrievedToken = service.getToken();

      // Assert
      expect(retrievedToken).toBe(token);
    });

    it('should return null when token does not exist', () => {
      // Act
      const token = service.getToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated$', () => {
    it('should emit true when user is authenticated', (done) => {
      // Arrange
      const expectedUrl = `${environment.apiUrl}/auth/login/patient`;

      // Act & Assert
      service.isAuthenticated$.subscribe((isAuth) => {
        if (isAuth) {
          expect(isAuth).toBe(true);
          done();
        }
      });

      service.loginPatient(mockCredentials).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      req.flush(mockLoginResponse);
    });
  });
});
