// Stub implementation - validation schemas tables don't exist

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => Promise<boolean> | boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

interface FormValidationConfig {
  rules: ValidationRule[];
  asyncRules?: ValidationRule[];
  debounceMs?: number;
}

export class ValidationService {
  private static instance: ValidationService;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  async validateForm(
    data: Record<string, any>,
    config: FormValidationConfig
  ): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string }> = [];

    // Basic validation only
    for (const rule of config.rules) {
      const value = data[rule.field];
      const isValid = this.validateField(value, rule);

      if (!isValid) {
        errors.push({
          field: rule.field,
          message: rule.message
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateField(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'phone':
        return /^(\+351|351)?[0-9]{9}$/.test(value?.replace(/\s/g, '') || '');
      
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      
      case 'min_length':
        return typeof value === 'string' && value.length >= (rule.value || 0);
      
      case 'max_length':
        return typeof value === 'string' && value.length <= (rule.value || Infinity);
      
      case 'pattern':
        return new RegExp(rule.value).test(value);
      
      case 'custom':
        return rule.customValidator ? Boolean(rule.customValidator(value)) : true;
      
      default:
        return true;
    }
  }

  async validateBookingData(...args: any[]): Promise<ValidationResult> {
    console.warn('[ValidationService] validateBookingData not fully implemented');
    return { valid: true, errors: [] };
  }

  async validateUserData(...args: any[]): Promise<ValidationResult> {
    console.warn('[ValidationService] validateUserData not fully implemented');
    return { valid: true, errors: [] };
  }

  async validateCompanyData(...args: any[]): Promise<ValidationResult> {
    console.warn('[ValidationService] validateCompanyData not fully implemented');
    return { valid: true, errors: [] };
  }

  clearDebounceTimer(key: string): void {
    const timer = this.debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }
  }
}

export const validationService = ValidationService.getInstance();
