/**
 * Modelo de profissional de saúde
 */
export interface Professional {
  id: string;
  fullName: string;
  email: string;
  crp?: string; // Registro profissional
  specialties: string[];
  description: string;
  rating: number;
  reviews: number;
  experience: number; // anos
  photo?: string;
  address: Address;
  availability: Availability;
  availableForNewPatients: boolean;
  consultationPrice?: number;
  totalPatients?: number;
  averageRating?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Availability {
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

/**
 * Filtros para busca de profissionais
 */
export interface ProfessionalFilters {
  specialties?: string[];
  maxPrice?: number;
  minRating?: number;
  city?: string;
  availability?: boolean;
}

/**
 * Resultado da busca paginada
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
