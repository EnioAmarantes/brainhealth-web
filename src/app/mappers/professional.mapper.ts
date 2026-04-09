import { Professional, Address } from '@app/models/professional.model';

/**
 * Mapeia a resposta do backend para o modelo esperado do frontend
 */
export class ProfessionalMapper {
  /**
   * Transforma dados da API do backend em modelo Professional do frontend
   */
  static mapFromBackend(data: any): Professional {
    return {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      crp: data.registrationNumber,
      specialties: data.specialties ? data.specialties.split(',').map((s: string) => s.trim()) : [],
      description: data.bio || '',
      rating: data.averageRating || 0,
      reviews: 0, // Backend não envia isso
      experience: data.profile?.yearsOfExperience || 0,
      photo: data.profilePhotoUrl,
      address: ProfessionalMapper.mapAddress(data),
      availability: ProfessionalMapper.mapAvailability(data),
      availableForNewPatients: data.availableForNewPatients || false,
      consultationPrice: data.consultationPrice,
      totalPatients: data.totalPatients || 0,
      averageRating: data.averageRating || 0,
    };
  }

  /**
   * Mapeia os dados de endereço
   */
  private static mapAddress(data: any): Address {
    return {
      street: data.address || '', // Backend envia endereço completo em um campo
      city: data.city || '',
      state: data.state || '',
      zipCode: '', // Backend não envia CEP
      country: 'Brasil', // Padrão Brasil
    };
  }

  /**
   * Mapeia a disponibilidade
   */
  private static mapAvailability(data: any): any {
    // Se temos o schedule em JSON string, parseamos
    if (data.profile?.availabilitySchedule) {
      try {
        const schedule = JSON.parse(data.profile.availabilitySchedule);
        return {
          days: [],
          startTime: '09:00',
          endTime: '18:00',
          schedule, // Adicionamos o schedule completo
        };
      } catch (e) {
        // Se falhar o parse, retornamos padrão
        return {
          days: [],
          startTime: '09:00',
          endTime: '18:00',
        };
      }
    }

    return {
      days: [],
      startTime: '09:00',
      endTime: '18:00',
    };
  }
}
