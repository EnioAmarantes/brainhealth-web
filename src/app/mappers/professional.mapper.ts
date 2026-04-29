import { Professional, Address } from '@app/models/professional.model';

/**
 * Mapeia a resposta do backend para o modelo esperado do frontend
 */
export class ProfessionalMapper {
  /**
   * Transforma dados da API do backend em modelo Professional do frontend
   */
  static mapFromBackend(data: any): Professional {
    // Cria um profile padrão se não existir
    const profile = data.profile || {};
    
    return {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber, // Número de telefone/WhatsApp do usuário
      crp: data.registrationNumber,
      specialties: ProfessionalMapper.mapSpecialties(data.specialties),
      description: data.bio || '',
      rating: data.averageRating || 0,
      reviews: 0, // Backend não envia isso
      experience: profile?.yearsOfExperience || 0,
      photo: data.profilePhotoUrl,
      address: ProfessionalMapper.mapAddress(data),
      availability: ProfessionalMapper.mapAvailability(data),
      availableForNewPatients: data.availableForNewPatients || false,
      consultationPrice: data.consultationPrice,
      totalPatients: data.totalPatients || 0,
      averageRating: data.averageRating || 0,
      profile: {
        id: profile?.id || '',
        education: profile?.education || '',
        yearsOfExperience: profile?.yearsOfExperience || 0,
        therapeuticApproaches: profile?.therapeuticApproaches || '',
        populationsServed: profile?.populationsServed || '',
        languages: profile?.languages || '',
        officeConsultation: profile?.officeConsultation || false,
        onlineConsultation: profile?.onlineConsultation || false,
        availabilitySchedule: profile?.availabilitySchedule || '{}',
      }
    };
  }

  /**
   * Mapeia as especialidades, garantindo que sempre retorna um array
   */
  private static mapSpecialties(specialties: any): string[] {
    if (!specialties) {
      return [];
    }
    
    // Se já é um array, apenas retorna
    if (Array.isArray(specialties)) {
      return specialties;
    }
    
    // Se é uma string, faz split por vírgula e limpa
    if (typeof specialties === 'string') {
      return specialties
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
    
    return [];
  }

  /**
   * Mapeia os dados de endereço
   */
  private static mapAddress(data: any): Address {
    return {
      street: data?.address || '', // Backend envia endereço completo em um campo
      city: data?.city || '',
      state: data?.state || '',
      zipCode: data?.zipCode || '', // Backend não envia CEP
      country: data?.country || 'Brasil', // Padrão Brasil
    };
  }

  /**
   * Mapeia a disponibilidade
   */
  private static mapAvailability(data: any): any {
    const profile = data?.profile;
    
    // Se temos o schedule em JSON string, parseamos
    if (profile?.availabilitySchedule && typeof profile.availabilitySchedule === 'string') {
      try {
        const schedule = JSON.parse(profile.availabilitySchedule);
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

  /**
   * Mapeia objetos Local para o formato esperado pelo Backend
   */
  static mapToBackend(professional: any): any {
    return {
      fullName: professional.fullName,
      email: professional.email,
      registrationNumber: professional.crp,
      specialties: Array.isArray(professional.specialties)
        ? professional.specialties.join(', ')
        : professional.specialties,
      bio: professional.description,
      profilePhotoUrl: professional.photo,
      availableForNewPatients: professional.availableForNewPatients,
      consultationPrice: professional.consultationPrice,
      address: professional.address?.street,
      city: professional.address?.city,
      state: professional.address?.state,
      zipCode: professional.address?.zipCode,
      country: professional.address?.country,
      profile: {
        yearsOfExperience: professional.experience,
        availabilitySchedule: JSON.stringify({
          days: professional.availability?.days || [],
          startTime: professional.availability?.startTime || '09:00',
          endTime: professional.availability?.endTime || '18:00',
        }),
      },
    };
  }
}
