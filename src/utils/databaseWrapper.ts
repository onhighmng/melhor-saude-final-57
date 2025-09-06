/**
 * Database operation wrapper with comprehensive error handling
 * Wraps Supabase operations to provide consistent error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { handleDatabaseError, logError } from './errorHandler';

export interface DatabaseResult<T> {
  data: T | null;
  error: any;
  success: boolean;
}

/**
 * Wraps Supabase query operations with error handling
 */
export const safeQuery = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context?: { table?: string; operation?: string }
): Promise<DatabaseResult<T>> => {
  try {
    const result = await operation();
    
    if (result.error) {
      const appError = handleDatabaseError(
        result.error, 
        context?.operation || 'query', 
        context?.table
      );
      return {
        data: null,
        error: appError,
        success: false
      };
    }

    return {
      data: result.data,
      error: null,
      success: true
    };
  } catch (error) {
    const appError = handleDatabaseError(
      error, 
      context?.operation || 'query', 
      context?.table
    );
    return {
      data: null,
      error: appError,
      success: false
    };
  }
};

/**
 * Wraps Supabase function invocations with error handling
 */
export const safeInvoke = async <T>(
  functionName: string,
  payload?: any
): Promise<DatabaseResult<T>> => {
  try {
    const result = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (result.error) {
      const appError = handleDatabaseError(
        result.error, 
        `invoke_${functionName}`, 
        'edge_function'
      );
      return {
        data: null,
        error: appError,
        success: false
      };
    }

    return {
      data: result.data,
      error: null,
      success: true
    };
  } catch (error) {
    const appError = handleDatabaseError(
      error, 
      `invoke_${functionName}`, 
      'edge_function'
    );
    return {
      data: null,
      error: appError,
      success: false
    };
  }
};

/**
 * Safe profile fetching with retry logic
 */
export const fetchUserProfile = async (userId: string, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await safeQuery(
      async () => {
        return await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
      },
      { table: 'profiles', operation: 'fetch_profile' }
    );

    if (result.success) {
      return result;
    }

    // If it's the last attempt, return the error
    if (attempt === retries) {
      return result;
    }

    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  }

  return {
    data: null,
    error: new Error('Max retries exceeded'),
    success: false
  };
};

/**
 * Batch operation wrapper
 */
export const safeBatchOperation = async <T>(
  operations: (() => Promise<{ data: T | null; error: any }>)[],
  context?: { operation?: string }
): Promise<DatabaseResult<T[]>> => {
  const results: T[] = [];
  const errors: any[] = [];

  for (const operation of operations) {
    const result = await safeQuery(operation, context);
    
    if (result.success && result.data) {
      results.push(result.data);
    } else {
      errors.push(result.error);
    }
  }

  if (errors.length > 0) {
    logError(new Error(`Batch operation failed: ${errors.length}/${operations.length} operations failed`));
    return {
      data: results.length > 0 ? results : null,
      error: errors,
      success: false
    };
  }

  return {
    data: results,
    error: null,
    success: true
  };
};

/**
 * Validates data before database operations
 */
export const validateBeforeOperation = (
  data: any, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};