import { supabase } from '@/integrations/supabase/client';
import { errorHandlingService } from './errorHandlingService';

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'custom' | 'unique' | 'exists';
  value?: any;
  message: string;
  customValidator?: (value: any) => Promise<boolean> | boolean;
  table?: string;
  column?: string;
  excludeId?: string;
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

  /**
   * Validate form data
   */
  async validateForm(
    data: Record<string, any>,
    config: FormValidationConfig
  ): Promise<ValidationResult> {
    try {
      const errors: Array<{ field: string; message: string }> = [];

      // Validate synchronous rules first
      for (const rule of config.rules) {
        const value = data[rule.field];
        const isValid = await this.validateField(value, rule, data);

        if (!isValid) {
          errors.push({
            field: rule.field,
            message: rule.message
          });
        }
      }

      // Validate asynchronous rules if no sync errors
      if (errors.length === 0 && config.asyncRules) {
        for (const rule of config.asyncRules) {
          const value = data[rule.field];
          const isValid = await this.validateField(value, rule, data);

          if (!isValid) {
            errors.push({
              field: rule.field,
              message: rule.message
            });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'ValidationService', action: 'validateForm' },
        'error'
      );

      return {
        valid: false,
        errors: [{ field: 'general', message: 'Validation failed due to system error' }]
      };
    }
  }

  /**
   * Validate single field
   */
  async validateField(
    value: any,
    rule: ValidationRule,
    contextData?: Record<string, any>
  ): Promise<boolean> {
    try {
      switch (rule.type) {
        case 'required':
          return this.validateRequired(value);
        
        case 'email':
          return this.validateEmail(value);
        
        case 'phone':
          return this.validatePhone(value);
        
        case 'url':
          return this.validateUrl(value);
        
        case 'min_length':
          return this.validateMinLength(value, rule.value);
        
        case 'max_length':
          return this.validateMaxLength(value, rule.value);
        
        case 'pattern':
          return this.validatePattern(value, rule.value);
        
        case 'custom':
          return await this.validateCustom(value, rule.customValidator);
        
        case 'unique':
          return await this.validateUnique(value, rule.table!, rule.column!, rule.excludeId);
        
        case 'exists':
          return await this.validateExists(value, rule.table!, rule.column!);
        
        default:
          return true;
      }
    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'ValidationService', action: 'validateField', field: rule.field },
        'error'
      );
      return false;
    }
  }

  /**
   * Validate required field
   */
  private validateRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  /**
   * Validate email format
   */
  private validateEmail(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Validate phone number (Portuguese format)
   */
  private validatePhone(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    const phoneRegex = /^(\+351|351)?[0-9]{9}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  }

  /**
   * Validate URL format
   */
  private validateUrl(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate minimum length
   */
  private validateMinLength(value: any, minLength: number): boolean {
    if (!value || typeof value !== 'string') return false;
    return value.length >= minLength;
  }

  /**
   * Validate maximum length
   */
  private validateMaxLength(value: any, maxLength: number): boolean {
    if (!value || typeof value !== 'string') return false;
    return value.length <= maxLength;
  }

  /**
   * Validate pattern
   */
  private validatePattern(value: any, pattern: string): boolean {
    if (!value || typeof value !== 'string') return false;
    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch {
      return false;
    }
  }

  /**
   * Validate custom rule
   */
  private async validateCustom(value: any, validator?: (value: any) => Promise<boolean> | boolean): Promise<boolean> {
    if (!validator) return true;
    try {
      const result = await validator(value);
      return Boolean(result);
    } catch {
      return false;
    }
  }

  /**
   * Validate uniqueness
   */
  private async validateUnique(
    value: any,
    table: string,
    column: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      if (!value) return true;

      let query = supabase
        .from(table)
        .select('id')
        .eq(column, value);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return !data || data.length === 0;

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'ValidationService', action: 'validateUnique', table, column },
        'error'
      );
      return false;
    }
  }

  /**
   * Validate existence
   */
  private async validateExists(value: any, table: string, column: string): Promise<boolean> {
    try {
      if (!value) return true;

      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq(column, value)
        .limit(1);

      if (error) throw error;

      return data && data.length > 0;

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'ValidationService', action: 'validateExists', table, column },
        'error'
      );
      return false;
    }
  }

  /**
   * Validate user registration
   */
  async validateUserRegistration(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'email', type: 'required', message: 'Email is required' },
        { field: 'email', type: 'email', message: 'Invalid email format' },
        { field: 'password', type: 'required', message: 'Password is required' },
        { field: 'password', type: 'min_length', value: 8, message: 'Password must be at least 8 characters' },
        { field: 'name', type: 'required', message: 'Name is required' },
        { field: 'name', type: 'min_length', value: 2, message: 'Name must be at least 2 characters' }
      ],
      asyncRules: [
        { field: 'email', type: 'unique', table: 'profiles', column: 'email', message: 'Email already exists' }
      ]
    };

    if (data.phone) {
      config.rules.push(
        { field: 'phone', type: 'phone', message: 'Invalid phone number format' }
      );
    }

    return this.validateForm(data, config);
  }

  /**
   * Validate company creation
   */
  async validateCompanyCreation(data: {
    company_name: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'company_name', type: 'required', message: 'Company name is required' },
        { field: 'company_name', type: 'min_length', value: 2, message: 'Company name must be at least 2 characters' },
        { field: 'contact_email', type: 'required', message: 'Contact email is required' },
        { field: 'contact_email', type: 'email', message: 'Invalid email format' }
      ],
      asyncRules: [
        { field: 'company_name', type: 'unique', table: 'companies', column: 'name', message: 'Company name already exists' },
        { field: 'contact_email', type: 'unique', table: 'companies', column: 'contact_email', message: 'Contact email already exists' }
      ]
    };

    if (data.contact_phone) {
      config.rules.push(
        { field: 'contact_phone', type: 'phone', message: 'Invalid phone number format' }
      );
    }

    if (data.address) {
      config.rules.push(
        { field: 'address', type: 'min_length', value: 10, message: 'Address must be at least 10 characters' }
      );
    }

    return this.validateForm(data, config);
  }

  /**
   * Validate booking creation
   */
  async validateBookingCreation(data: {
    user_id: string;
    prestador_id: string;
    pillar: string;
    session_date: string;
    session_time: string;
    session_type: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'user_id', type: 'required', message: 'User ID is required' },
        { field: 'prestador_id', type: 'required', message: 'Provider ID is required' },
        { field: 'pillar', type: 'required', message: 'Pillar is required' },
        { field: 'session_date', type: 'required', message: 'Session date is required' },
        { field: 'session_time', type: 'required', message: 'Session time is required' },
        { field: 'session_type', type: 'required', message: 'Session type is required' }
      ],
      asyncRules: [
        { field: 'user_id', type: 'exists', table: 'profiles', column: 'id', message: 'User does not exist' },
        { field: 'prestador_id', type: 'exists', table: 'prestadores', column: 'id', message: 'Provider does not exist' }
      ]
    };

    return this.validateForm(data, config);
  }

  /**
   * Validate session creation
   */
  async validateSessionCreation(data: {
    user_id: string;
    specialist_id: string;
    pillar: string;
    session_date: string;
    session_time: string;
    session_type: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'user_id', type: 'required', message: 'User ID is required' },
        { field: 'specialist_id', type: 'required', message: 'Specialist ID is required' },
        { field: 'pillar', type: 'required', message: 'Pillar is required' },
        { field: 'session_date', type: 'required', message: 'Session date is required' },
        { field: 'session_time', type: 'required', message: 'Session time is required' },
        { field: 'session_type', type: 'required', message: 'Session type is required' }
      ],
      asyncRules: [
        { field: 'user_id', type: 'exists', table: 'profiles', column: 'id', message: 'User does not exist' },
        { field: 'specialist_id', type: 'exists', table: 'profiles', column: 'id', message: 'Specialist does not exist' }
      ]
    };

    return this.validateForm(data, config);
  }

  /**
   * Validate feedback submission
   */
  async validateFeedbackSubmission(data: {
    session_id: string;
    rating: number;
    feedback_text?: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'session_id', type: 'required', message: 'Session ID is required' },
        { field: 'rating', type: 'required', message: 'Rating is required' },
        { field: 'rating', type: 'custom', message: 'Rating must be between 1 and 5', customValidator: (value) => value >= 1 && value <= 5 }
      ],
      asyncRules: [
        { field: 'session_id', type: 'exists', table: 'bookings', column: 'id', message: 'Session does not exist' }
      ]
    };

    if (data.feedback_text) {
      config.rules.push(
        { field: 'feedback_text', type: 'min_length', value: 10, message: 'Feedback must be at least 10 characters' }
      );
    }

    return this.validateForm(data, config);
  }

  /**
   * Validate invite creation
   */
  async validateInviteCreation(data: {
    company_id: string;
    email: string;
    role: string;
    invited_by: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'company_id', type: 'required', message: 'Company ID is required' },
        { field: 'email', type: 'required', message: 'Email is required' },
        { field: 'email', type: 'email', message: 'Invalid email format' },
        { field: 'role', type: 'required', message: 'Role is required' },
        { field: 'invited_by', type: 'required', message: 'Invited by is required' }
      ],
      asyncRules: [
        { field: 'company_id', type: 'exists', table: 'companies', column: 'id', message: 'Company does not exist' },
        { field: 'email', type: 'unique', table: 'profiles', column: 'email', message: 'Email already exists' },
        { field: 'invited_by', type: 'exists', table: 'profiles', column: 'id', message: 'Inviter does not exist' }
      ]
    };

    return this.validateForm(data, config);
  }

  /**
   * Validate resource creation
   */
  async validateResourceCreation(data: {
    title: string;
    content: string;
    pillar: string;
    resource_type: string;
    created_by: string;
  }): Promise<ValidationResult> {
    const config: FormValidationConfig = {
      rules: [
        { field: 'title', type: 'required', message: 'Title is required' },
        { field: 'title', type: 'min_length', value: 5, message: 'Title must be at least 5 characters' },
        { field: 'content', type: 'required', message: 'Content is required' },
        { field: 'content', type: 'min_length', value: 50, message: 'Content must be at least 50 characters' },
        { field: 'pillar', type: 'required', message: 'Pillar is required' },
        { field: 'resource_type', type: 'required', message: 'Resource type is required' },
        { field: 'created_by', type: 'required', message: 'Created by is required' }
      ],
      asyncRules: [
        { field: 'created_by', type: 'exists', table: 'profiles', column: 'id', message: 'Creator does not exist' }
      ]
    };

    return this.validateForm(data, config);
  }

  /**
   * Validate with debounce
   */
  async validateWithDebounce(
    field: string,
    value: any,
    rules: ValidationRule[],
    debounceMs: number = 300
  ): Promise<ValidationResult> {
    return new Promise((resolve) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(field);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        const result = await this.validateForm({ [field]: value }, { rules });
        this.debounceTimers.delete(field);
        resolve(result);
      }, debounceMs);

      this.debounceTimers.set(field, timer);
    });
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove HTML tags and trim whitespace
        sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
      } else if (typeof value === 'number') {
        // Ensure number is valid
        sanitized[key] = isNaN(value) ? 0 : value;
      } else if (Array.isArray(value)) {
        // Sanitize array elements
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? item.replace(/<[^>]*>/g, '').trim() : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate file upload
   */
  async validateFileUpload(
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxSize: number = 5 * 1024 * 1024 // 5MB
  ): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string }> = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      errors.push({
        field: 'file',
        message: 'File name is required'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate date range
   */
  validateDateRange(startDate: string, endDate: string): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      errors.push({ field: 'start_date', message: 'Invalid start date' });
    }

    if (isNaN(end.getTime())) {
      errors.push({ field: 'end_date', message: 'Invalid end date' });
    }

    if (errors.length === 0 && start >= end) {
      errors.push({ field: 'date_range', message: 'Start date must be before end date' });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate time slot
   */
  validateTimeSlot(time: string, duration: number = 60): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      errors.push({ field: 'time', message: 'Invalid time format (HH:MM)' });
    }

    if (errors.length === 0) {
      const [hours, minutes] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      
      if (totalMinutes < 0 || totalMinutes >= 24 * 60) {
        errors.push({ field: 'time', message: 'Time must be within 24 hours' });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const validationService = ValidationService.getInstance();
