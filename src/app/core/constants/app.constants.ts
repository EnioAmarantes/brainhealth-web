/**
 * Constantes da aplicação - Evita magic strings
 */

export const APP_CONSTANTS = {
  // App Info
  APP_NAME: 'Brain Health',
  APP_VERSION: '1.0.0',

  // Routes
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    LOGOUT: '/logout',
    
    // Patient Routes
    PATIENT: {
      ROOT: '/patient',
      LOGIN: '/patient/login',
      SIGNUP: '/patient/signup',
      DASHBOARD: '/patient/dashboard',
      QUESTIONNAIRE: '/patient/questionnaire',
      PROFESSIONALS: '/patient/professionals',
      CONSULTATIONS: '/patient/consultations',
      PROFILE: '/patient/profile'
    },
    
    // Professional Routes
    PROFESSIONAL: {
      ROOT: '/professional',
      LOGIN: '/professional/login',
      SIGNUP: '/professional/signup',
      DASHBOARD: '/professional/dashboard',
      PATIENTS: '/professional/patients',
      AVAILABILITY: '/professional/availability',
      CONSULTATIONS: '/professional/consultations',
      PROFILE: '/professional/profile'
    },
    
    // Admin Routes (Future)
    ADMIN: {
      ROOT: '/admin',
      LOGIN: '/admin/login',
      DASHBOARD: '/admin/dashboard',
      USERS: '/admin/users',
      ANALYTICS: '/admin/analytics'
    }
  },

  // User Roles
  ROLES: {
    PATIENT: 'patient',
    PROFESSIONAL: 'professional',
    ADMIN: 'admin',
    CLINIC: 'clinic'
  },

  // Questionnaire Types
  QUESTIONNAIRES: {
    PHQ9: 'phq-9',
    GAD7: 'gad-7',
    DASS21: 'dass-21',
    BDI2: 'bdi-2'
  },

  // LocalStorage Keys
  STORAGE: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    CURRENT_USER: 'current_user',
    USER_ROLE: 'user_role'
  },

  // API
  API: {
    BASE_URL: '/api/v1',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  }
};
