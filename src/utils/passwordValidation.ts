// Mock password validation for demo
export const validatePassword = (password: string) => {
  return { isValid: true, errors: [] };
};

export const validatePasswordStrength = (password: string) => {
  return { valid: true, issues: [] };
};