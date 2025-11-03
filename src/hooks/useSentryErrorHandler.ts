import { useCallback } from 'react';
import * as Sentry from '@sentry/react';

interface ErrorContext {
  component?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Hook for handling errors with automatic Sentry capture
 * Usage: const { handleError, captureError } = useSentryErrorHandler('ComponentName');
 */
export function useSentryErrorHandler(componentName: string) {
  /**
   * Capture an exception with context
   */
  const captureError = useCallback(
    (error: Error | string, context?: ErrorContext) => {
      const errorMessage = typeof error === 'string' ? error : error.message;
      
      console.error(`[${componentName}] Error:`, errorMessage);

      Sentry.captureException(
        typeof error === 'string' ? new Error(error) : error,
        {
          contexts: {
            component: {
              name: componentName,
              ...context,
            },
          },
          tags: {
            component: componentName,
          },
        }
      );
    },
    [componentName]
  );

  /**
   * Wrap async operations with error handling
   */
  const handleAsyncError = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      errorContext?: ErrorContext
    ): Promise<T | null> => {
      try {
        return await fn();
      } catch (error) {
        captureError(error as Error, {
          ...errorContext,
          type: 'async-operation',
        });
        return null;
      }
    },
    [captureError]
  );

  /**
   * Wrap sync operations with error handling
   */
  const handleSyncError = useCallback(
    <T,>(fn: () => T, errorContext?: ErrorContext): T | null => {
      try {
        return fn();
      } catch (error) {
        captureError(error as Error, {
          ...errorContext,
          type: 'sync-operation',
        });
        return null;
      }
    },
    [captureError]
  );

  /**
   * Add a breadcrumb for tracking user actions
   */
  const addBreadcrumb = useCallback(
    (message: string, data?: Record<string, any>) => {
      Sentry.addBreadcrumb({
        category: componentName,
        message,
        level: 'info',
        data,
      });
    },
    [componentName]
  );

  /**
   * Capture a message with context
   */
  const captureMessage = useCallback(
    (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
      Sentry.captureMessage(message, level);
      addBreadcrumb(message);
    },
    [addBreadcrumb]
  );

  return {
    captureError,
    handleAsyncError,
    handleSyncError,
    addBreadcrumb,
    captureMessage,
  };
}

