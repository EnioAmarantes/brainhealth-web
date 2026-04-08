import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/interceptors/auth.interceptor';
import { AuthService } from '@app/services/auth.service';
import { HttpClient } from '@angular/common/http';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Request Interception', () => {
    it('should add Authorization header when token exists', () => {
      // Arrange
      const token = 'test-token-123';
      localStorage.setItem('authToken', token);

      // Act
      httpClient.get('/api/test').subscribe();

      // Assert
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      
      req.flush({});
    });

    it('should not add Authorization header when token does not exist', () => {
      // Arrange
      localStorage.clear();

      // Act
      httpClient.get('/api/test').subscribe();

      // Assert
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(false);
      
      req.flush({});
    });

    it('should preserve existing headers', () => {
      // Arrange
      const token = 'test-token-123';
      localStorage.setItem('authToken', token);

      // Act
      httpClient.get('/api/test', {
        headers: { 'Custom-Header': 'custom-value' }
      }).subscribe();

      // Assert
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(req.request.headers.get('Custom-Header')).toBe('custom-value');
      
      req.flush({});
    });
  });

  describe('Response Interception', () => {
    it('should handle 401 response', () => {
      // Arrange
      const token = 'expired-token';
      localStorage.setItem('authToken', token);

      // Act
      httpClient.get('/api/test').subscribe(
        () => fail('should have failed'),
        (error) => {
          // Assert
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 response', () => {
      // Arrange
      const token = 'valid-token';
      localStorage.setItem('authToken', token);

      // Act
      httpClient.get('/api/admin').subscribe(
        () => fail('should have failed'),
        (error) => {
          // Assert
          expect(error.status).toBe(403);
        }
      );

      const req = httpMock.expectOne('/api/admin');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
