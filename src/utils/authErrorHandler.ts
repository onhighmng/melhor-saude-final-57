/**
 * Comprehensive error handler for authentication and registration flows
 * Prevents common errors before they occur
 */

import { PostgrestError } from '@supabase/supabase-js';

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  retryable: boolean;
}

export const getAuthErrorMessage = (error: unknown): AuthError => {
  const defaultError: AuthError = {
    code: 'UNKNOWN',
    message: 'Erro desconhecido',
    userFriendlyMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    retryable: true,
  };

  if (!error) return defaultError;

  // Supabase Auth Errors
  if (typeof error === 'object' && 'message' in error) {
    const err = error as any;
    const message = err.message || '';

    // Invalid credentials
    if (message.includes('Invalid login credentials') || message.includes('Invalid password')) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: message,
        userFriendlyMessage: 'Email ou senha incorretos. Verifique suas credenciais.',
        retryable: true,
      };
    }

    // Email not confirmed
    if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
      return {
        code: 'EMAIL_NOT_CONFIRMED',
        message: message,
        userFriendlyMessage: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.',
        retryable: false,
      };
    }

    // Too many requests
    if (message.includes('Too many requests') || message.includes('rate_limit')) {
      return {
        code: 'RATE_LIMIT',
        message: message,
        userFriendlyMessage: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
        retryable: true,
      };
    }

    // User already exists
    if (message.includes('already registered') || message.includes('already exists') || message.includes('User already registered')) {
      return {
        code: 'USER_EXISTS',
        message: message,
        userFriendlyMessage: 'Este email já está registado. Tente fazer login ou recuperar sua senha.',
        retryable: false,
      };
    }

    // Weak password
    if (message.includes('Password') && (message.includes('weak') || message.includes('too short'))) {
      return {
        code: 'WEAK_PASSWORD',
        message: message,
        userFriendlyMessage: 'A senha é muito fraca. Use pelo menos 8 caracteres com letras e números.',
        retryable: true,
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        message: message,
        userFriendlyMessage: 'Erro de conexão. Verifique sua internet e tente novamente.',
        retryable: true,
      };
    }

    // Database errors (PostgrestError)
    if ('code' in err && err.code) {
      return handleDatabaseError(err as PostgrestError);
    }

    // Generic error with message
    return {
      code: 'AUTH_ERROR',
      message: message,
      userFriendlyMessage: message || defaultError.userFriendlyMessage,
      retryable: true,
    };
  }

  // String errors
  if (typeof error === 'string') {
    return {
      code: 'STRING_ERROR',
      message: error,
      userFriendlyMessage: error,
      retryable: true,
    };
  }

  return defaultError;
};

const handleDatabaseError = (error: PostgrestError): AuthError => {
  const code = error.code || '';
  const message = error.message || '';

  // Duplicate key (unique violation)
  if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
    return {
      code: 'DUPLICATE_ENTRY',
      message: message,
      userFriendlyMessage: 'Já existe um registo com estes dados. Por favor, verifique os dados inseridos.',
      retryable: false,
    };
  }

  // Foreign key violation
  if (code === '23503' || message.includes('foreign key')) {
    return {
      code: 'FOREIGN_KEY_VIOLATION',
      message: message,
      userFriendlyMessage: 'Dados inválidos. Alguma referência está incorreta.',
      retryable: false,
    };
  }

  // Not null violation
  if (code === '23502' || message.includes('null value') || message.includes('not-null constraint')) {
    return {
      code: 'NOT_NULL_VIOLATION',
      message: message,
      userFriendlyMessage: 'Dados incompletos. Por favor, preencha todos os campos obrigatórios.',
      retryable: true,
    };
  }

  // Check constraint violation
  if (code === '23514' || message.includes('check constraint')) {
    return {
      code: 'CHECK_CONSTRAINT',
      message: message,
      userFriendlyMessage: 'Dados inválidos. Por favor, verifique os valores inseridos.',
      retryable: true,
    };
  }

  // Permission denied / RLS violation
  if (code === '42501' || message.includes('permission denied') || message.includes('RLS')) {
    return {
      code: 'PERMISSION_DENIED',
      message: message,
      userFriendlyMessage: 'Sem permissão para esta operação. Contacte o suporte.',
      retryable: false,
    };
  }

  // Generic database error
  return {
    code: 'DATABASE_ERROR',
    message: message,
    userFriendlyMessage: 'Erro na base de dados. Por favor, tente novamente mais tarde.',
    retryable: true,
  };
};

/**
 * Retry helper for operations that might fail due to transient issues
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on non-retryable errors
      const authError = getAuthErrorMessage(error);
      if (!authError.retryable) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número' };
  }
  
  return { valid: true };
};

/**
 * Safely handles profile loading with fallbacks
 */
export const safeProfileLoad = async (
  loadProfile: () => Promise<any>,
  userId: string
): Promise<any | null> => {
  try {
    const profile = await withRetry(loadProfile, 2);
    return profile;
  } catch (error) {
    console.error(`[Auth] Failed to load profile for user ${userId}:`, error);
    
    // Return minimal profile to prevent complete failure
    return {
      id: userId,
      role: 'user',
      is_active: false,
      metadata: {},
    };
  }
};

