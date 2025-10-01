/**
 * Centralized error handling utilities
 * Provides consistent error logging and user feedback
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly context?: ErrorContext;

  constructor(
    message: string, 
    code: string = 'UNKNOWN_ERROR', 
    userMessage?: string,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage || 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    this.context = context;
  }
}

/**
 * Centralized error logger
 */
export const logError = (error: Error | AppError, context?: ErrorContext) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
    context: error instanceof AppError ? error.context : context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Logged');
    console.error('Error:', error);
    console.table(errorInfo);
    console.groupEnd();
  }

  // In production, you could send to an error tracking service
  // Example: Sentry, LogRocket, or custom endpoint
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    try {
      // Example: Send to custom endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      }).catch(console.error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
};

/**
 * Wraps async functions with error handling
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), context);
      return null;
    }
  };
};

/**
 * Database operation error handler
 */
export const handleDatabaseError = (error: any, operation: string, table?: string) => {
  const errorCode = error?.code || 'DB_ERROR';
  const context: ErrorContext = {
    component: 'Database',
    action: operation,
    metadata: { table, originalError: error }
  };

  let userMessage = 'Erro na base de dados. Por favor, tente novamente.';

  // Handle specific Supabase errors
  switch (errorCode) {
    case 'PGRST116':
      userMessage = 'Não tem permissão para aceder a este recurso.';
      break;
    case '23505':
      userMessage = 'Já existe um registo com essas informações.';
      break;
    case '23503':
      userMessage = 'Não é possível eliminar este registo porque está a ser usado.';
      break;
    case 'PGRST301':
      userMessage = 'Recurso não encontrado.';
      break;
  }

  const appError = new AppError(
    error?.message || 'Database operation failed',
    errorCode,
    userMessage,
    context
  );

  logError(appError);
  return appError;
};

/**
 * Authentication error handler
 */
export const handleAuthError = (error: any, action: string) => {
  const context: ErrorContext = {
    component: 'Authentication',
    action,
    metadata: { originalError: error }
  };

  let userMessage = 'Erro de autenticação. Por favor, tente novamente.';
  let errorCode = 'AUTH_ERROR';

  if (error?.message) {
    if (error.message.includes('Invalid login credentials')) {
      userMessage = 'Credenciais inválidas. Verifique o email e palavra-passe.';
      errorCode = 'INVALID_CREDENTIALS';
    } else if (error.message.includes('Email not confirmed')) {
      userMessage = 'Por favor, confirme o seu email antes de fazer login.';
      errorCode = 'EMAIL_NOT_CONFIRMED';
    } else if (error.message.includes('Too many requests')) {
      userMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
      errorCode = 'RATE_LIMIT';
    }
  }

  const appError = new AppError(
    error?.message || 'Authentication failed',
    errorCode,
    userMessage,
    context
  );

  logError(appError);
  return appError;
};

/**
 * Network/API error handler
 */
export const handleNetworkError = (error: any, endpoint: string) => {
  const context: ErrorContext = {
    component: 'Network',
    action: 'API_CALL',
    metadata: { endpoint, originalError: error }
  };

  let userMessage = 'Erro de ligação. Verifique a sua internet e tente novamente.';
  let errorCode = 'NETWORK_ERROR';

  if (error?.status) {
    switch (error.status) {
      case 400:
        userMessage = 'Pedido inválido. Verifique os dados introduzidos.';
        errorCode = 'BAD_REQUEST';
        break;
      case 401:
        userMessage = 'Não tem autorização. Faça login novamente.';
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        userMessage = 'Não tem permissão para esta ação.';
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        userMessage = 'Recurso não encontrado.';
        errorCode = 'NOT_FOUND';
        break;
      case 500:
        userMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        errorCode = 'SERVER_ERROR';
        break;
    }
  }

  const appError = new AppError(
    error?.message || 'Network request failed',
    errorCode,
    userMessage,
    context
  );

  logError(appError);
  return appError;
};

/**
 * Form validation error handler
 */
export const handleValidationError = (field: string, value: any, rule: string) => {
  const context: ErrorContext = {
    component: 'Validation',
    action: 'FIELD_VALIDATION',
    metadata: { field, value: typeof value, rule }
  };

  const userMessage = `Campo "${field}" é inválido.`;
  
  const appError = new AppError(
    `Validation failed for field ${field}`,
    'VALIDATION_ERROR',
    userMessage,
    context
  );

  logError(appError);
  return appError;
};