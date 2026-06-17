import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, shareReplay, map } from 'rxjs/operators';
import { 
  Professional, 
  ProfessionalFilters, 
  PaginatedResult 
} from '@app/models/professional.model';
import { environment } from '@environments/environment';
import { ProfessionalMapper } from '@app/mappers/professional.mapper';

export interface AdminProfessionalModerationItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  registrationNumber: string;
  specialties: string;
  city: string;
  state: string;
  availableForNewPatients: boolean;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: string;
  moderatedAtUtc?: string;
  moderationNotes?: string;
}

export interface UpdateProfessionalModerationPayload {
  isApproved?: boolean;
  isVisible?: boolean;
  moderationNotes?: string;
}

interface BackendPagedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

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
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => ProfessionalMapper.mapFromBackend(data))
    );
  }

  /**
   * Obtém profissionais recomendados baseado em triagem
   */
  getRecommendedProfessionals(specialties: string[]): Observable<Professional[]> {
    const primarySpecialty = specialties.find(s => !!s?.trim())?.trim();
    if (!primarySpecialty) {
      return new Observable<Professional[]>(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    let params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '20')
      .set('specialty', primarySpecialty)
      .set('availableOnly', 'true');

    return this.http.get<BackendPagedResponse<any>>(`${this.apiUrl}/search`, { params }).pipe(
      map(result => (result.data ?? []).map(item => ProfessionalMapper.mapFromBackend(item)))
    );
  }

  /**
   * Obtém lista de especialidades disponíveis
   */
  getSpecialties(): Observable<string[]> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', '200');

    return this.http.get<BackendPagedResponse<any>>(`${this.apiUrl}/search`, { params }).pipe(
      map(result => result.data ?? []),
      map(items => items
        .flatMap(item => (item.specialties ?? '')
          .toString()
          .split(',')
          .map((s: string) => s.trim())
        )
        .filter((s: string) => !!s)
      ),
      map(items => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b)))
    );
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
      params = params.set('searchTerm', query);
    }

    if (filters.specialties && filters.specialties.length > 0) {
      params = params.set('specialty', filters.specialties[0]);
    }

    if (filters.maxPrice) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.minRating) {
      params = params.set('minRating', filters.minRating.toString());
    }

    if (filters.city) {
      params = params.set('location', filters.city);
    }

    if (filters.availability !== undefined) {
      params = params.set('availableOnly', filters.availability.toString());
    }

    return this.http.get<BackendPagedResponse<any>>(
      `${this.apiUrl}/search`,
      { params }
    ).pipe(
      map(result => ({
        items: (result.data ?? []).map(item => ProfessionalMapper.mapFromBackend(item)),
        total: result.totalRecords ?? 0,
        page: result.currentPage ?? page,
        pageSize: result.pageSize ?? 10,
        totalPages: result.totalPages ?? 0
      }))
    );
  }

  /**
   * Obtém dados do profissional atual (autenticado)
   * Usa o endpoint de perfil autenticado do backend
   */
  getCurrentProfessional(): Observable<Professional> {
    const url = `${this.apiUrl}/me/profile`;
    console.log('[ProfessionalService] Chamando getCurrentProfessional:', url);
    
    return this.http.get<any>(url).pipe(
      tap(data => {
        console.log('[ProfessionalService] ✅ Resposta recebida:', data);
      }),
      map(data => {
        console.log('[ProfessionalService] Mapeando dados do profissional');
        return ProfessionalMapper.mapFromBackend(data);
      }),
      tap(mapped => {
        console.log('[ProfessionalService] ✅ Profissional mapeado:', mapped?.id);
      })
    );
  }

  /**
   * Obtém perfil detalhado do profissional
   */
  getProfessionalProfile(professionalId: string): Observable<Professional> {
    return this.http.get<any>(`${this.apiUrl}/${professionalId}`).pipe(
      map(data => ProfessionalMapper.mapFromBackend(data))
    );
  }

  /**
   * Atualiza disponibilidade do profissional
   */
  updateAvailability(professionalId: string, available: boolean): Observable<Professional> {
    return this.http.patch<Professional>(
      `${this.apiUrl}/${professionalId}/availability`,
      available
    );
  }

  /**
   * Atualiza dados do profissional autenticado (perfil próprio)
   * Usa o endpoint de perfil autenticado do backend
   */
  updateCurrentProfessional(data: Partial<Professional>): Observable<Professional> {
    const url = `${this.apiUrl}/me/profile`;
    
    return this.http.put<any>(
      url,
      this.mapProfessionalToBackend(data)
    ).pipe(
      map(response => ProfessionalMapper.mapFromBackend(response))
    );
  }

  /**
   * Lista profissionais para moderação no painel admin
   */
  getModerationQueue(approved?: boolean, visible?: boolean): Observable<AdminProfessionalModerationItem[]> {
    let params = new HttpParams();

    if (approved !== undefined) {
      params = params.set('approved', approved.toString());
    }

    if (visible !== undefined) {
      params = params.set('visible', visible.toString());
    }

    return this.http.get<AdminProfessionalModerationItem[]>(`${this.apiUrl}/admin/moderation`, { params });
  }

  /**
   * Atualiza status de aprovação/visibilidade de um profissional
   */
  updateProfessionalModeration(
    professionalId: string,
    payload: UpdateProfessionalModerationPayload
  ): Observable<AdminProfessionalModerationItem> {
    return this.http.patch<AdminProfessionalModerationItem>(
      `${this.apiUrl}/${professionalId}/moderation`,
      payload
    );
  }

  /**
   * Mapeia dados do Professional para o formato do backend
   */
  private mapProfessionalToBackend(professional: Partial<Professional>): any {
    return ProfessionalMapper.mapToBackend(professional);
  }
}
