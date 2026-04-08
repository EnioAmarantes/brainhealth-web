/**
 * Modelo de questionário de triagem
 */
export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  order: number;
}

export enum QuestionType {
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

/**
 * Modelo de respostas do questionário
 */
export interface QuestionnaireResponse {
  questionnaireId: string;
  answers: Answer[];
  completedAt: Date;
  recommendedSpecialties?: string[];
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

/**
 * Modelo de resultado da triagem
 */
export interface ScreeningResult {
  recommendedSpecialties: string[];
  score: number;
  description: string;
}
