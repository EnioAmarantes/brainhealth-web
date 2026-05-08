export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  CPF: /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  EMAIL: 'Email inválido',
  MIN_LENGTH: 'Campo muito curto',
  MAX_LENGTH: 'Campo muito longo',
  PATTERN: 'Formato inválido',
  PASSWORD_WEAK: 'Senha fraca. Use letras, números e caracteres especiais',
  MATCH: 'Os valores não correspondem'
};

export const VALIDATION_RULES = {
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 11
};
