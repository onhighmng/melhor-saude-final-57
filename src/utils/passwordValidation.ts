// Password validation utility using the database function
import { supabase } from '@/integrations/supabase/client';

export interface PasswordValidationResult {
  valid: boolean;
  issues: string[];
}

// Client-side validation for immediate feedback
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const issues: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    issues.push('Deve ter pelo menos 8 caracteres');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    issues.push('Deve conter pelo menos uma letra maiúscula');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    issues.push('Deve conter pelo menos uma letra minúscula');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    issues.push('Deve conter pelo menos um número');
  }

  // Check for special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push('Deve conter pelo menos um caracter especial');
  }

  // Check against common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    issues.push('Palavra-passe muito comum e facilmente adivinhada');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

// Server-side validation using the database function
export async function validatePasswordWithDatabase(password: string): Promise<PasswordValidationResult> {
  try {
    const { data, error } = await supabase.rpc('validate_password_strength', {
      password_text: password
    });

    if (error) {
      console.error('Database password validation error:', error);
      // Fallback to client-side validation
      return validatePasswordStrength(password);
    }

    // Type guard to safely access the response data
    if (data && typeof data === 'object' && data !== null) {
      const validationData = data as { valid?: boolean; issues?: string[] };
      return {
        valid: validationData.valid || false,
        issues: Array.isArray(validationData.issues) ? validationData.issues : []
      };
    }

    // Fallback to client-side validation if data structure is unexpected
    return validatePasswordStrength(password);
  } catch (error) {
    console.error('Error validating password:', error);
    // Fallback to client-side validation
    return validatePasswordStrength(password);
  }
}

// Check against Have I Been Pwned (client-side implementation placeholder)
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // In a real implementation, you would:
  // 1. Hash the password using SHA-1
  // 2. Send only the first 5 characters of the hash to HaveIBeenPwned
  // 3. Check if the remaining hash appears in the response
  
  // For now, return false (not breached) as this requires external API
  // and proper implementation with k-anonymity
  
  try {
    // Placeholder - in production, implement proper HIBP checking
    // const hashedPassword = await sha1(password);
    // const prefix = hashedPassword.substring(0, 5);
    // const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    // ... check if password hash appears in response
    
    return false;
  } catch (error) {
    console.warn('Could not check password breach status:', error);
    return false;
  }
}

// Combined validation function for comprehensive checking
export async function validatePasswordComprehensive(password: string): Promise<PasswordValidationResult & { isBreached?: boolean }> {
  const basicValidation = validatePasswordStrength(password);
  
  // Only check for breaches if password passes basic validation
  if (basicValidation.valid) {
    try {
      const isBreached = await checkPasswordBreach(password);
      if (isBreached) {
        return {
          valid: false,
          issues: [...basicValidation.issues, 'Esta palavra-passe foi comprometida em vazamentos de dados'],
          isBreached: true
        };
      }
    } catch (error) {
      console.warn('Breach check failed, continuing with basic validation');
    }
  }

  return {
    ...basicValidation,
    isBreached: false
  };
}