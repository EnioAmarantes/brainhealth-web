/**
 * Enum de tipos de usuário
 */
export enum UserType {
  PROFESSIONAL = 'PROFESSIONAL',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN'
}

/**
 * Modelo de usuário autenticado (padrão interno)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserType;
  token?: string;
  refreshToken?: string;
}

/**
 * Resposta do backend (como vem do servidor)
 */
export interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string; // "Professional", "Patient", "Admin"
    isActive: boolean;
  };
}

/**
 * Modelo de resposta de login (padrão interno)
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Modelo de credenciais de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}
