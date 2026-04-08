import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, shareReplay } from 'rxjs/operators';
import { 
  Professional, 
  ProfessionalFilters, 
  PaginatedResult 
} from '@app/models/professional.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private apiUrl = `${environment.apiUrl}/professionals`;
  
  private searchQuerySubject = new BehaviorSubject<string>('');
  private filtersSubject = new BehaviorSubject<ProfessionalFilters>({});
  private pageSubject = new BehaviorSubject<number>(1);

  public professionals$: Observable<PaginatedResult<Professional>>;

  constructor(private http: HttpClient) {
    // Implementa debouncing e lazy loading
    this.professionals$ = this.searchQuerySubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.fetchProfessionals(query, this.filtersSubject.value, this.pageSubject.value)),
      shareReplay(1)
    );
  }

  /**
   * Busca profissionais com filtros
   */
  searchProfessionals(query: string): void {
    this.searchQuerySubject.next(query);
    this.pageSubject.next(1);
  }

  /**
   * Aplica filtros
   */
  applyFilters(filters: ProfessionalFilters): void {
    this.filtersSubject.next(filters);
    this.pageSubject.next(1);
  }

  /**
   * Vai para página específica
   */
  goToPage(page: number): void {
    this.pageSubject.next(page);
  }

  /**
   * Obtém profissional por ID
   */
  getProfessionalById(id: string): Observable<Professional> {
    return this.http.get<Professional>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtém profissionais recomendados baseado em triagem
   */
  getRecommendedProfessionals(specialties: string[]): Observable<Professional[]> {
    let params = new HttpParams();
    specialties.forEach(specialty => {
      params = params.append('specialties', specialty);
    });

    return this.http.get<Professional[]>(
      `${this.apiUrl}/recommended`,
      { params }
    );
  }

  /**
   * Obtém lista de especialidades disponíveis
   */
  getSpecialties(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/specialties`);
  }

  /**
   * Busca profissionais de forma privada
   */
  private fetchProfessionals(
    query: string,
    filters: ProfessionalFilters,
    page: number
  ): Observable<PaginatedResult<Professional>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', '10');

    if (query) {
      params = params.set('query', query);
    }

    if (filters.specialties && filters.specialties.length > 0) {
      filters.specialties.forEach(specialty => {
        params = params.append('specialties', specialty);
      });
    }

    if (filters.maxPrice) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.minRating) {
      params = params.set('minRating', filters.minRating.toString());
    }

    if (filters.city) {
      params = params.set('city', filters.city);
    }

    if (filters.availability !== undefined) {
      params = params.set('availability', filters.availability.toString());
    }

    return this.http.get<PaginatedResult<Professional>>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * Obtém dados do profissional atual (autenticado)
   * Usa o endpoint de perfil autenticado do backend
   */
  getCurrentProfessional(): Observable<Professional> {
    return this.http.get<Professional>(`${this.apiUrl}/me/profile`);
  }

  /**
   * Obtém perfil detalhado do profissional
   */
  getProfessionalProfile(professionalId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${professionalId}/profile`);
  }

  /**
   * Atualiza disponibilidade do profissional
   */
  updateAvailability(professionalId: string, available: boolean): Observable<Professional> {
    return this.http.patch<Professional>(
      `${this.apiUrl}/${professionalId}/availability`,
      { availableForNewPatients: available }
    );
  }

  /**
   * Atualiza dados do profissional
   */
  updateProfessional(professionalId: string, data: Partial<Professional>): Observable<Professional> {
    return this.http.patch<Professional>(
      `${this.apiUrl}/${professionalId}`,
      data
    );
  }
}
