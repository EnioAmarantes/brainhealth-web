export interface ProfessionalProfile {
  id: string; // UUID
  education: string;
  yearsOfExperience: number;
  therapeuticApproaches: string;
  populationsServed: string;
  languages: string;
  officeConsultation: boolean;
  onlineConsultation: boolean;
  availabilitySchedule: string; // JSON string com horários por dia
}

export interface AvailabilitySchedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}