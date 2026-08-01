export interface QuestionnaireTemplate {
  id: string;
  type: string;
  version: string;
  title: string;
  questions: string | QuestionnaireQuestionsPayload | BackendQuestionnaireQuestionsPayload;
}

export enum QuestionType {
  SELECT = 'SELECT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOX = 'CHECKBOX',
  TEXT = 'TEXT',
  SCALE = 'SCALE'
}

export interface QuestionOption {
  id: string;
  code?: string;
  text: string;
  value: string;
  order: number;
}

export interface QuestionItem {
  key: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options: QuestionOption[];
}

export interface QuestionnaireQuestionsPayload {
  questions: QuestionItem[];
}

export interface BackendQuestionnaireQuestionsPayload {
  questions: BackendQuestionItem[];
}

export interface BackendQuestionItem {
  id: string;
  code: string;
  key?: string;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: BackendQuestionOption[];
}

export interface BackendQuestionOption {
  id: string;
  code: string;
  text: string;
  value: string;
  order: number;
}

export interface SubmitQuestionnaireAnswerRequest {
  type: string;
  answers: string;
  fullName: string;
  phoneNumber: string;
  operatingSystem?: string;
  deviceType?: string;
  browserName?: string;
  symptomsDuration?: string;
  freeTextDescription?: string;
}

export interface QuestionnaireAnswerResponse {
  id: string;
  type: string;
  title: string;
  questions?: string;
  answers?: string;
  totalScore?: number;
  result?: string;
  recommendations?: string;
  freeTextDescription?: string;
  symptomsDuration?: string;
  aiSynthesis?: string;
  identifiedIssues?: string;
  completedAt: string;
  reviewedByProfessional: boolean;
  professionalNotes?: string;
}

export interface AIAnalysisRequest {
  patientDescription: string;
  previousContext?: string;
}

export interface RecommendedProfessional {
  id: string;
  name: string;
  specialties: string;
  bio?: string;
  location: string;
  consultationPrice: number;
  averageRating: number;
  totalPatients: number;
  availableForNewPatients: boolean;
  profilePhotoUrl?: string;
  compatibilityScore: number;
  recommendationReason?: string;
}

export interface RecommendedProfessionalsResponse {
  problemSynthesis: string;
  identifiedIssues: string[];
  recommendedSpecialties: string[];
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  recommendedProfessionals: RecommendedProfessional[];
  totalAvailable: number;
  generalRecommendations?: string;
}

