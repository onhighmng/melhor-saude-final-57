/**
 * Error handling utilities for secure error display
 * Prevents leaking database schema information to users
 */

export const getGenericErrorMessage = (context: string): string => {
  const messages: Record<string, string> = {
    'loading': 'Não foi possível carregar os dados.',
    'saving': 'Não foi possível guardar as alterações.',
    'deleting': 'Não foi possível eliminar o item.',
    'creating': 'Não foi possível criar o item.',
    'updating': 'Não foi possível atualizar o item.',
    'uploading': 'Não foi possível fazer upload do ficheiro.',
    'downloading': 'Não foi possível fazer download do ficheiro.',
    'sending': 'Não foi possível enviar a mensagem.',
    'authentication': 'Erro de autenticação. Por favor, tente novamente.',
    'authorization': 'Não tem permissão para realizar esta ação.',
    'network': 'Erro de ligação. Verifique a sua ligação à Internet.',
    'unknown': 'Ocorreu um erro inesperado. Contacte o suporte.'
  };
  
  return messages[context] || messages['unknown'];
};

/**
 * Log errors securely without exposing internal details to users
 */
export const logErrorSecurely = (error: any, context: string) => {
  // Log full error to console for debugging (only in dev)
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  
  // In production, send to monitoring service (e.g., Sentry)
  // Example:
  // if (import.meta.env.PROD && typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, { tags: { context } });
  // }
};

/**
 * Extract safe error message for user display
 */
export const getErrorMessage = (error: any): string => {
  // Only show safe error messages to users
  if (error?.message) {
    // Check if it's a database error (contains SQL keywords or table/column names)
    const dbErrorPatterns = [
      'column', 'table', 'relation', 'constraint', 'violates foreign key',
      'duplicate key', 'null value', 'permission denied', 'unauthorized'
    ];
    
    const errorMsg = error.message.toLowerCase();
    const isDbError = dbErrorPatterns.some(pattern => errorMsg.includes(pattern));
    
    if (isDbError) {
      return 'Erro ao processar a solicitação. Contacte o suporte.';
    }
    
    // Safe user-friendly error messages
    if (errorMsg.includes('email')) {
      return 'Erro relacionado com o email.';
    }
    if (errorMsg.includes('password')) {
      return 'Erro relacionado com a palavra-passe.';
    }
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return 'Erro de ligação. Verifique a sua ligação à Internet.';
    }
  }
  
  return 'Ocorreu um erro. Tente novamente mais tarde.';
};

