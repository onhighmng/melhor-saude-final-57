/**
 * Validate password strength with proper security requirements
 * Minimum 12 characters, uppercase, lowercase, number, special character
 */
export const validatePassword = (password: string) => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Mínimo 12 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Requer pelo menos uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Requer pelo menos uma letra minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Requer pelo menos um número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Requer pelo menos um carácter especial (!@#$%^&*...)');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.some(cp => password.toLowerCase().includes(cp))) {
    errors.push('Palavra-passe demasiado comum');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validatePasswordStrength = (password: string) => {
  const issues: string[] = [];
  
  if (password.length < 12) {
    issues.push('Mínimo 12 caracteres necessários');
  }
  if (!/[A-Z]/.test(password)) {
    issues.push('Adicione letras maiúsculas');
  }
  if (!/[a-z]/.test(password)) {
    issues.push('Adicione letras minúsculas');
  }
  if (!/[0-9]/.test(password)) {
    issues.push('Adicione números');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('Adicione caracteres especiais');
  }
  
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123'
  ];
  
  if (commonPasswords.some(cp => password.toLowerCase().includes(cp))) {
    issues.push('Evite palavras-passe comuns');
  }
  
  return { valid: issues.length === 0, issues };
};