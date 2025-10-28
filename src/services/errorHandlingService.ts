import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  userId?: string;
  userRole?: string;
  companyId?: string;
  sessionId?: string;
  bookingId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack?: string;
  context: ErrorContext;
  user_agent?: string;
  url?: string;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution?: string;
}

interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Log error with context
   */
  async logError(
    error: Error | string,
    context: ErrorContext = {},
    level: 'error' | 'warning' | 'info' | 'debug' = 'error'
  ): Promise<string | null> {
    try {
      const errorLog: ErrorLog = {
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level,
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'string' ? undefined : error.stack,
        context: {
          ...context,
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined
        },
        timestamp: new Date().toISOString(),
        resolved: false
      };

      const { data, error: insertError } = await supabase
        .from('error_logs')
        .insert(errorLog)
        .select()
        .single();

      if (insertError) throw insertError;

      // Send to external error tracking service (Sentry, Bugsnag, etc.)
      await this.sendToExternalService(errorLog);

      // Check if this is a critical error that needs immediate attention
      if (level === 'error' && this.isCriticalError(errorLog)) {
        await this.handleCriticalError(errorLog);
      }

      return data.id;

    } catch (logError) {
      console.error('Failed to log error:', logError);
      return null;
    }
  }

  /**
   * Validate data against rules
   */
  validateData(data: Record<string, any>, rules: ValidationRule[]): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of rules) {
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

  /**
   * Validate single field
   */
  private validateField(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'phone':
        return /^(\+351|351)?[0-9]{9}$/.test(value.replace(/\s/g, ''));
      
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
        return rule.customValidator ? rule.customValidator(value) : true;
      
      default:
        return true;
    }
  }

  /**
   * Handle API errors
   */
  async handleApiError(error: any, context: ErrorContext = {}): Promise<void> {
    try {
      let errorMessage = 'An unexpected error occurred';
      let errorLevel: 'error' | 'warning' | 'info' | 'debug' = 'error';

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorMessage = data?.message || 'Bad request';
            errorLevel = 'warning';
            break;
          case 401:
            errorMessage = 'Unauthorized access';
            errorLevel = 'warning';
            break;
          case 403:
            errorMessage = 'Access forbidden';
            errorLevel = 'warning';
            break;
          case 404:
            errorMessage = 'Resource not found';
            errorLevel = 'warning';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded';
            errorLevel = 'warning';
            break;
          case 500:
            errorMessage = 'Internal server error';
            errorLevel = 'error';
            break;
          default:
            errorMessage = data?.message || `HTTP ${status} error`;
        }

        // Add response data to context
        context.metadata = {
          ...context.metadata,
          status,
          response_data: data
        };
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - no response received';
        errorLevel = 'error';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error';
      }

      await this.logError(errorMessage, context, errorLevel);

    } catch (logError) {
      console.error('Failed to handle API error:', logError);
    }
  }

  /**
   * Handle database errors
   */
  async handleDatabaseError(error: any, context: ErrorContext = {}): Promise<void> {
    try {
      let errorMessage = 'Database error occurred';
      let errorLevel: 'error' | 'warning' | 'info' | 'debug' = 'error';

      if (error.code) {
        switch (error.code) {
          case '23505': // Unique violation
            errorMessage = 'Duplicate entry - this record already exists';
            errorLevel = 'warning';
            break;
          case '23503': // Foreign key violation
            errorMessage = 'Referenced record does not exist';
            errorLevel = 'warning';
            break;
          case '23502': // Not null violation
            errorMessage = 'Required field is missing';
            errorLevel = 'warning';
            break;
          case '42P01': // Undefined table
            errorMessage = 'Database table does not exist';
            errorLevel = 'error';
            break;
          case '42703': // Undefined column
            errorMessage = 'Database column does not exist';
            errorLevel = 'error';
            break;
          default:
            errorMessage = error.message || 'Database error';
        }

        // Add error code to context
        context.metadata = {
          ...context.metadata,
          error_code: error.code,
          error_details: error.details
        };
      }

      await this.logError(errorMessage, context, errorLevel);

    } catch (logError) {
      console.error('Failed to handle database error:', logError);
    }
  }

  /**
   * Handle validation errors
   */
  async handleValidationError(
    errors: Array<{ field: string; message: string }>,
    context: ErrorContext = {}
  ): Promise<void> {
    try {
      const errorMessage = `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
      
      context.metadata = {
        ...context.metadata,
        validation_errors: errors
      };

      await this.logError(errorMessage, context, 'warning');

    } catch (logError) {
      console.error('Failed to handle validation error:', logError);
    }
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(error: any, context: ErrorContext = {}): Promise<void> {
    try {
      let errorMessage = 'Authentication error';
      let errorLevel: 'error' | 'warning' | 'info' | 'debug' = 'warning';

      if (error.message) {
        if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid login credentials';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'User account not found';
        } else if (error.message.includes('Account disabled')) {
          errorMessage = 'Account is disabled';
        } else if (error.message.includes('Email not verified')) {
          errorMessage = 'Email address not verified';
        } else {
          errorMessage = error.message;
        }
      }

      context.metadata = {
        ...context.metadata,
        auth_error: error.message
      };

      await this.logError(errorMessage, context, errorLevel);

    } catch (logError) {
      console.error('Failed to handle auth error:', logError);
    }
  }

  /**
   * Handle permission errors
   */
  async handlePermissionError(
    action: string,
    resource: string,
    context: ErrorContext = {}
  ): Promise<void> {
    try {
      const errorMessage = `Permission denied: ${action} on ${resource}`;
      
      context.metadata = {
        ...context.metadata,
        action,
        resource
      };

      await this.logError(errorMessage, context, 'warning');

    } catch (logError) {
      console.error('Failed to handle permission error:', logError);
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('error_logs')
        .select('level, resolved, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const logs = data || [];
      const totalErrors = logs.length;
      const errorCount = logs.filter(l => l.level === 'error').length;
      const warningCount = logs.filter(l => l.level === 'warning').length;
      const infoCount = logs.filter(l => l.level === 'info').length;
      const debugCount = logs.filter(l => l.level === 'debug').length;
      const resolvedCount = logs.filter(l => l.resolved).length;
      const unresolvedCount = totalErrors - resolvedCount;

      return {
        total_errors: totalErrors,
        error_count: errorCount,
        warning_count: warningCount,
        info_count: infoCount,
        debug_count: debugCount,
        resolved_count: resolvedCount,
        unresolved_count: unresolvedCount,
        resolution_rate: totalErrors > 0 ? (resolvedCount / totalErrors) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting error stats:', error);
      return {
        total_errors: 0,
        error_count: 0,
        warning_count: 0,
        info_count: 0,
        debug_count: 0,
        resolved_count: 0,
        unresolved_count: 0,
        resolution_rate: 0
      };
    }
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(limit: number = 50): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting unresolved errors:', error);
      return [];
    }
  }

  /**
   * Resolve error
   */
  async resolveError(
    errorId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution
        })
        .eq('id', errorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resolving error:', error);
      return false;
    }
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(errorLog: ErrorLog): boolean {
    const criticalPatterns = [
      'database connection',
      'authentication failed',
      'payment processing',
      'email delivery',
      'sms delivery',
      'webhook delivery',
      'subscription',
      'security',
      'unauthorized access'
    ];

    const message = errorLog.message.toLowerCase();
    return criticalPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Handle critical error
   */
  private async handleCriticalError(errorLog: ErrorLog): Promise<void> {
    try {
      // Send immediate notification to admins
      await this.notifyAdmins(errorLog);
      
      // Create high-priority ticket
      await this.createSupportTicket(errorLog);
      
      // Log to external monitoring service
      await this.sendToExternalService(errorLog);

    } catch (error) {
      console.error('Failed to handle critical error:', error);
    }
  }

  /**
   * Notify admins of critical error
   */
  private async notifyAdmins(errorLog: ErrorLog): Promise<void> {
    try {
      // This would integrate with the email service
      console.log('Notifying admins of critical error:', errorLog.id);
      
      // In a real implementation, this would send emails/SMS to admins
      // await emailService.sendCustomEmail({
      //   to: 'admin@melhorsaude.com',
      //   subject: `CRITICAL ERROR: ${errorLog.message}`,
      //   html_content: `<h2>Critical Error Alert</h2><p>${errorLog.message}</p>`
      // });

    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  /**
   * Create support ticket
   */
  private async createSupportTicket(errorLog: ErrorLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: `Critical Error: ${errorLog.message}`,
          description: `Error ID: ${errorLog.id}\n\nMessage: ${errorLog.message}\n\nContext: ${JSON.stringify(errorLog.context, null, 2)}`,
          priority: 'high',
          status: 'open',
          error_log_id: errorLog.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

    } catch (error) {
      console.error('Failed to create support ticket:', error);
    }
  }

  /**
   * Send to external error tracking service
   */
  private async sendToExternalService(errorLog: ErrorLog): Promise<void> {
    try {
      // This would integrate with Sentry, Bugsnag, or similar service
      console.log('Sending error to external service:', errorLog.id);
      
      // In a real implementation, this would send to external service
      // await sentry.captureException(new Error(errorLog.message), {
      //   tags: {
      //     level: errorLog.level,
      //     component: errorLog.context.component
      //   },
      //   extra: errorLog.context
      // });

    } catch (error) {
      console.error('Failed to send to external service:', error);
    }
  }

  /**
   * Retry failed operations
   */
  async retryFailedOperation(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          await this.logError(
            `Operation failed after ${maxRetries} attempts: ${error.message}`,
            { attempt, maxRetries },
            'error'
          );
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }

  /**
   * Create error boundary for React components
   */
  createErrorBoundary(component: string) {
    return (error: Error, errorInfo: any) => {
      this.logError(error, {
        component,
        metadata: {
          errorInfo,
          stack: error.stack
        }
      }, 'error');
    };
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance();

// Export validation rules for common use cases
export const validationRules = {
  email: [
    { field: 'email', type: 'required' as const, message: 'Email is required' },
    { field: 'email', type: 'email' as const, message: 'Invalid email format' }
  ],
  phone: [
    { field: 'phone', type: 'required' as const, message: 'Phone number is required' },
    { field: 'phone', type: 'phone' as const, message: 'Invalid phone number format' }
  ],
  password: [
    { field: 'password', type: 'required' as const, message: 'Password is required' },
    { field: 'password', type: 'min_length' as const, value: 8, message: 'Password must be at least 8 characters' }
  ],
  name: [
    { field: 'name', type: 'required' as const, message: 'Name is required' },
    { field: 'name', type: 'min_length' as const, value: 2, message: 'Name must be at least 2 characters' }
  ],
  companyName: [
    { field: 'company_name', type: 'required' as const, message: 'Company name is required' },
    { field: 'company_name', type: 'min_length' as const, value: 2, message: 'Company name must be at least 2 characters' }
  ]
};
