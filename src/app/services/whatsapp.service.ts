import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

interface WhatsAppConsultationData {
  professionalName: string;
  patientDescription: string;
  aiAnalysisSynthesis: string;
  identifiedIssues: string[];
  recommendedSpecialties: string[];
  urgencyLevel: string;
  patientName: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private static readonly DefaultPhoneNumber = '5543996903617';

  generateWhatsAppLink(data: WhatsAppConsultationData): string {
    const message = this.formatConsultationMessage(data);
    const encodedMessage = encodeURIComponent(message);
    const configuredNumber = environment.whatsAppDefaultNumber ?? WhatsAppService.DefaultPhoneNumber;
    const normalizedNumber = configuredNumber.replace(/\D/g, '');

    return `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;
  }

  openWhatsAppChat(link: string): void {
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  private formatConsultationMessage(data: WhatsAppConsultationData): string {
    const issuesText = data.identifiedIssues.length > 0
      ? data.identifiedIssues.join(', ')
      : 'Nao informado';

    const specialtiesText = data.recommendedSpecialties.length > 0
      ? data.recommendedSpecialties.join(', ')
      : 'Nao informado';

    return `Olá! Gostaria de agendar uma consulta.\n\n` +
      `Paciente: ${data.patientName}\n` +
      `Profissional sugerido: ${data.professionalName}\n\n` +
      `Relato:\n${data.patientDescription}\n\n` +
      `Sintese da IA:\n${data.aiAnalysisSynthesis}\n\n` +
      `Problemas identificados: ${issuesText}\n` +
      `Especialidades sugeridas: ${specialtiesText}\n` +
      `Urgencia: ${this.translateUrgency(data.urgencyLevel)}\n\n` +
      `Enviado via BrainHealth`;
  }

  private translateUrgency(level: string): string {
    const normalized = level.trim().toLowerCase();

    switch (normalized) {
      case 'critical':
        return 'Critico';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Medio';
      case 'low':
        return 'Baixo';
      default:
        return level;
    }
  }
}
