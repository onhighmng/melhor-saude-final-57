// Enhanced error message mapping with user-friendly translations

export interface ApiError {
  code?: string;
  message: string;
  details?: any;
}

export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_EMAIL_NOT_CONFIRMED: 'auth/email-not-confirmed',
  AUTH_TOO_MANY_REQUESTS: 'auth/too-many-requests',
  AUTH_NETWORK_ERROR: 'auth/network-error',
  AUTH_SESSION_EXPIRED: 'auth/session-expired',
  
  // Booking errors
  BOOKING_SLOT_UNAVAILABLE: 'booking/slot-unavailable',
  BOOKING_PROVIDER_UNAVAILABLE: 'booking/provider-unavailable',
  BOOKING_INSUFFICIENT_SESSIONS: 'booking/insufficient-sessions',
  BOOKING_VALIDATION_ERROR: 'booking/validation-error',
  BOOKING_CONFLICT: 'booking/conflict',
  BOOKING_NETWORK_ERROR: 'booking/network-error',
  
  // Session errors
  SESSION_BALANCE_INSUFFICIENT: 'session/balance-insufficient',
  SESSION_EXPIRED: 'session/expired',
  SESSION_ALLOCATION_FAILED: 'session/allocation-failed',
  
  // Network errors
  NETWORK_CONNECTION_ERROR: 'network/connection-error',
  NETWORK_TIMEOUT: 'network/timeout',
  NETWORK_SERVER_ERROR: 'network/server-error',
  
  // Database errors
  DB_CONSTRAINT_VIOLATION: 'db/constraint-violation',
  DB_NOT_FOUND: 'db/not-found',
  DB_PERMISSION_DENIED: 'db/permission-denied',
  
  // Generic errors
  UNKNOWN_ERROR: 'unknown/error',
  VALIDATION_ERROR: 'validation/error'
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Email ou palavra-passe incorretos. Verifique os seus dados e tente novamente.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'Utilizador não encontrado. Verifique se o email está correto.',
  [ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED]: 'Email não confirmado. Verifique a sua caixa de entrada.',
  [ERROR_CODES.AUTH_TOO_MANY_REQUESTS]: 'Demasiadas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  [ERROR_CODES.AUTH_NETWORK_ERROR]: 'Erro de ligação. Verifique a sua conexão à internet.',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Sessão expirada. Por favor, inicie sessão novamente.',
  
  // Booking
  [ERROR_CODES.BOOKING_SLOT_UNAVAILABLE]: 'Este horário já não está disponível. Por favor, escolha outro.',
  [ERROR_CODES.BOOKING_PROVIDER_UNAVAILABLE]: 'O prestador não está disponível neste momento. Tente outro horário.',
  [ERROR_CODES.BOOKING_INSUFFICIENT_SESSIONS]: 'Não tem sessões disponíveis. Contacte o administrador ou adquira mais sessões.',
  [ERROR_CODES.BOOKING_VALIDATION_ERROR]: 'Dados de agendamento inválidos. Verifique as informações inseridas.',
  [ERROR_CODES.BOOKING_CONFLICT]: 'Conflito de horário. Por favor, escolha outro horário.',
  [ERROR_CODES.BOOKING_NETWORK_ERROR]: 'Erro de conexão durante o agendamento. Tente novamente.',
  
  // Session
  [ERROR_CODES.SESSION_BALANCE_INSUFFICIENT]: 'Saldo de sessões insuficiente. Contacte o administrador.',
  [ERROR_CODES.SESSION_EXPIRED]: 'As suas sessões expiraram. Contacte o administrador para renovar.',
  [ERROR_CODES.SESSION_ALLOCATION_FAILED]: 'Erro ao alocar sessão. Contacte o suporte técnico.',
  
  // Network
  [ERROR_CODES.NETWORK_CONNECTION_ERROR]: 'Erro de conexão. Verifique a sua internet e tente novamente.',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Pedido demorou muito tempo. Tente novamente.',
  [ERROR_CODES.NETWORK_SERVER_ERROR]: 'Erro do servidor. Tente novamente mais tarde.',
  
  // Database
  [ERROR_CODES.DB_CONSTRAINT_VIOLATION]: 'Operação não permitida devido a restrições de dados.',
  [ERROR_CODES.DB_NOT_FOUND]: 'Registo não encontrado.',
  [ERROR_CODES.DB_PERMISSION_DENIED]: 'Não tem permissão para realizar esta operação.',
  
  // Generic
  [ERROR_CODES.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos. Verifique as informações inseridas.'
};

export function getErrorMessage(error: any): string {
  // Handle different error formats
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  if (error?.message) {
    // Map common Supabase/PostgreSQL errors
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
      return ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS];
    }
    
    if (message.includes('email not confirmed')) {
      return ERROR_MESSAGES[ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED];
    }
    
    if (message.includes('too many requests')) {
      return ERROR_MESSAGES[ERROR_CODES.AUTH_TOO_MANY_REQUESTS];
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES[ERROR_CODES.NETWORK_CONNECTION_ERROR];
    }
    
    if (message.includes('timeout')) {
      return ERROR_MESSAGES[ERROR_CODES.NETWORK_TIMEOUT];
    }
    
    if (message.includes('already booked') || message.includes('conflict')) {
      return ERROR_MESSAGES[ERROR_CODES.BOOKING_CONFLICT];
    }
    
    if (message.includes('insufficient') || message.includes('balance')) {
      return ERROR_MESSAGES[ERROR_CODES.SESSION_BALANCE_INSUFFICIENT];
    }
    
    if (message.includes('not found')) {
      return ERROR_MESSAGES[ERROR_CODES.DB_NOT_FOUND];
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ERROR_MESSAGES[ERROR_CODES.DB_PERMISSION_DENIED];
    }
    
    // Return original message if no mapping found
    return error.message;
  }
  
  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

export function createError(code: string, details?: any): ApiError {
  return {
    code,
    message: ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    details
  };
}

export function isRetryableError(error: any): boolean {
  if (typeof error === 'string') {
    return false;
  }
  
  const retryableCodes = [
    ERROR_CODES.NETWORK_CONNECTION_ERROR,
    ERROR_CODES.NETWORK_TIMEOUT,
    ERROR_CODES.NETWORK_SERVER_ERROR,
    ERROR_CODES.BOOKING_SLOT_UNAVAILABLE,
    ERROR_CODES.BOOKING_CONFLICT
  ];
  
  return retryableCodes.includes(error?.code) ||
         error?.message?.includes('network') ||
         error?.message?.includes('timeout') ||
         error?.message?.includes('connection');
}