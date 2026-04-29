import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export interface WhatsAppConsultationData {
  professionalPhoneNumber: string;
  professionalName: string;
  patientDescription: string;
  aiAnalysisSynthesis: string;
  identifiedIssues: string[];
  recommendedSpecialties: string[];
  urgencyLevel: string;
  patientName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  constructor() {}

  /**
   * Gera link wa.me para abrir conversa com o profissional
   * Abre o WhatsApp com mensagem pré-formatada
   */
  generateWhatsAppLink(data: WhatsAppConsultationData): string {
    const message = this.formatConsultationMessage(
      data.patientName || 'Paciente',
      data.patientDescription,
      data.aiAnalysisSynthesis,
      data.identifiedIssues,
      data.recommendedSpecialties,
      data.urgencyLevel
    );

    // Remover caracteres especiais que podem quebrar a URL
    const encodedMessage = encodeURIComponent(message);
    
    // NÚMERO DE TESTE PARA DEBUG
    const phoneForTest = !environment.production ? "5543996903617" : data.professionalPhoneNumber;
    
    // Log para ajudar no debug
    console.log('📱 Gerando link WhatsApp com número:', phoneForTest);
    console.log('📄 Mensagem:', message);
    
    // Formato: https://wa.me/numero?text=mensagem
    return `https://wa.me/${phoneForTest}?text=${encodedMessage}`;
  }

  /**
   * Abre link do WhatsApp em nova aba
   */
  openWhatsAppChat(whatsappLink: string): void {
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  }

  /**
   * Abre conversa no WhatsApp com os dados da análise de IA e relato do paciente
   * Método simplificado que faz tudo em uma chamada
   */
  openConsultationChat(sessionData: any): void {
    if (!sessionData) {
      console.error('Dados da sessão não encontrados');
      return;
    }

    const whatsAppData = {
      professionalPhoneNumber: '',
      professionalName: 'Profissional',
      patientDescription: sessionData.patientDescription,
      aiAnalysisSynthesis: sessionData.aiAnalysisResult.problemSynthesis,
      identifiedIssues: sessionData.aiAnalysisResult.identifiedIssues,
      recommendedSpecialties: sessionData.aiAnalysisResult.recommendedSpecialties,
      urgencyLevel: sessionData.aiAnalysisResult.urgencyLevel,
      patientName: sessionData.questionnaireResponses?.patientName || 'Paciente'
    };

    const link = this.generateWhatsAppLink(whatsAppData);
    this.openWhatsAppChat(link);
  }

  /**
   * Formato da mensagem WhatsApp com dados do questionário e análise IA
   */
  private formatConsultationMessage(
    patientName: string,
    patientDescription: string,
    aiSynthesis: string,
    issues: string[],
    specialties: string[],
    urgencyLevel: string
  ): string {
    const issuesText = issues.join(', ');
    const specialtiesText = specialties.join(', ');

    return `Olá! Tenho um novo paciente para você.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 RELATÓRIO DO PACIENTE

👤 Nome: ${patientName}

💬 Relato do Paciente:
${patientDescription}

🧠 Análise da IA:
${aiSynthesis}

⚠ Problemas Identificados:
${issuesText}

💼 Especialidades Recomendadas:
${specialtiesText}

${this.getUrgencyEmoji(urgencyLevel)} Nível de Urgência:
${this.translateUrgency(urgencyLevel)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💚 Enviado via BrainHealth`;
  }

  /**
   * Retorna emoji baseado em nível de urgência
   */
  private getUrgencyEmoji(urgency: string): string {
    const emojiMap: { [key: string]: string } = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };
    return emojiMap[urgency.toLowerCase()] || '🔔';
  }

  /**
   * Traduz nível de urgência para texto em português
   */
  private translateUrgency(level: string): string {
    const translations: { [key: string]: string } = {
      'critical': 'CRÍTICO - Requer atenção imediata',
      'high': 'ALTO - Importante atender em breve',
      'medium': 'MÉDIO - Atenção normal',
      'low': 'BAIXO - Pode ser agendado posteriormente'
    };
    return translations[level.toLowerCase()] || level;
  }
}
