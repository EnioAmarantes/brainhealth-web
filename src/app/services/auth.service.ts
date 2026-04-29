import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, delay, map } from 'rxjs/operators';
import { User, LoginCredentials, LoginResponse, UserType, BackendLoginResponse } from '@app/models/auth.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  /**
   * Faz login de profissional
   */
  loginProfessional(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<BackendLoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      map(response => this.mapBackendResponse(response)),
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        this.handleLoginError(error);
        throw error;
      })
    );
  }

  /**
   * Faz login de paciente
   */
  loginPatient(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<BackendLoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      map(response => this.mapBackendResponse(response)),
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        this.handleLoginError(error);
        throw error;
      })
    );
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<BackendLoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      map(response => this.mapBackendResponse(response)),
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        this.handleLoginError(error);
        throw error;
      })
    );
  }

  /**
   * Faz logout
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Registra novo paciente
   */
  registerPatient(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register/patient`,
      userData
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        this.handleLoginError(error);
        throw error;
      })
    );
  }

  /**
   * Registra novo profissional
   */
  registerProfessional(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register/professional`,
      userData
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(error => {
        this.handleLoginError(error);
        throw error;
      })
    );
  }

  /**
   * Atualiza token de autenticação
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null as any);
    }

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(() => {
        this.logout();
        return of(null as any);
      })
    );
  }

  /**
   * Obtém token de autenticação
   */
  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('[AuthService.getToken] Token retrieved:', !!token);
    if (token) {
      console.log('[AuthService.getToken] Token length:', token.length);
    }
    return token;
  }

  /**
   * Obtém refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtém tipo de usuário
   */
  getUserType(): UserType | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Inicializa autenticação verificando tokens armazenados
   */
  private initializeAuth(): void {
    const user = this.getUserFromStorage();
    if (user && this.hasValidToken()) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Mapeia a resposta do backend para o formato interno
   */
  private mapBackendResponse(backendResponse: BackendLoginResponse): LoginResponse {
    // Converte a role string do backend para o enum UserType
    const roleMap: { [key: string]: UserType } = {
      'Professional': UserType.PROFESSIONAL,
      'Patient': UserType.PATIENT,
      'Admin': UserType.ADMIN
    };

    const userType = roleMap[backendResponse.user.role] || UserType.PATIENT;

    const user: User = {
      id: backendResponse.user.id,
      email: backendResponse.user.email,
      name: backendResponse.user.fullName,
      role: userType
    };

    return {
      user,
      token: backendResponse.accessToken,
      refreshToken: backendResponse.refreshToken
    };
  }

  /**
   * Trata sucesso do login OAuth (público para ser usado pelo OAuthService)
   */
  handleOAuthSuccess(response: LoginResponse): void {
    this.handleLoginSuccess(response);
  }

  /**
   * Trata sucesso de login
   */
  private handleLoginSuccess(response: LoginResponse): void {
    console.log('[AuthService.handleLoginSuccess] Saving token to localStorage');
    console.log('[AuthService.handleLoginSuccess] Token:', response.token.substring(0, 50) + '...');
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    console.log('[AuthService.handleLoginSuccess] ✓ Token saved. Retrieved:', this.getToken()?.substring(0, 50) + '...');
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Trata erro de login
   */
  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    this.logout();
  }

  /**
   * Obtém usuário do localStorage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verifica se token é válido (não expirou)
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Decodifica JWT simples (não valida assinatura)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }
}
