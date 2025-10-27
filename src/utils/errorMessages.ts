export const getErrorMessage = (error: any): string => {
  // Database errors
  if (error.code === '23505') return 'Este registo já existe';
  if (error.code === '23503') return 'Não é possível eliminar. Existem dependências';
  if (error.code === 'PGRST116') return 'Registo não encontrado';
  
  // Auth errors
  if (error.message?.includes('Invalid login')) return 'Email ou password incorretos';
  if (error.message?.includes('Email not confirmed')) return 'Por favor, confirme o seu email';
  if (error.message?.includes('User already registered')) return 'Este email já está registado';
  
  // Network errors
  if (error.message?.includes('Failed to fetch')) return 'Erro de conexão. Verifique a sua internet';
  if (error.message?.includes('timeout')) return 'A operação demorou muito tempo. Tente novamente';
  
  // Quota errors
  if (error.message?.includes('quota')) return 'Sem sessões disponíveis. Contacte o RH';
  
  // Default
  return error.message || 'Ocorreu um erro inesperado';
};
