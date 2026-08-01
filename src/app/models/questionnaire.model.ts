export interface QuestionnaireTemplate {
  id: string;
  type: string;
  version: string;
  title: string;
  questions: string;
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

export interface SubmitQuestionnaireAnswerRequest {
  type: string;
  answers: string;
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

