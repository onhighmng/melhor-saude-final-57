/**
 * Get Portuguese error message based on error code or message
 * @param error - Error object with code or message
 * @returns Portuguese error message
 */
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.code) {
    // Map error codes to Portuguese messages
    const errorMessageMap: Record<string, string> = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-not-found': 'Utilizador não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/too-many-requests': 'Demasiadas tentativas. Tente novamente mais tarde',
      'network-error': 'Erro de conexão. Verifique a sua internet',
      'permission-denied': 'Sem permissão para esta ação',
      'not-found': 'Recurso não encontrado',
    };
    
    return errorMessageMap[error.code] || 'Ocorreu um erro';
  }
  
  return 'Ocorreu um erro';
};