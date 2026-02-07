/**
 * Error messages for OperatingHoursService
 * Centralized constants for maintainability
 */
export const ERROR_MESSAGES = {
  INVALID_TIME_RANGE:
    'O horário de fechamento deve ser posterior ao horário de abertura',
  OVERLAP:
    'Já existe um horário de funcionamento que conflita com este período',
  NOT_FOUND: (id: string) => `Operating Hour with ID ${id} not found`,
} as const;
