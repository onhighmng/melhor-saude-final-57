import * as Sentry from '@sentry/react';
import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Sentry API interceptor for automatic error tracking
 * Wraps Supabase client with error capturing
 */
export function initializeSentryApiInterceptor() {
  // Track API calls as breadcrumbs
  const originalFetch = window.fetch;

  window.fetch = function (...args: Parameters<typeof fetch>) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;

    // Add breadcrumb for API call
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${config?.method || 'GET'} ${url}`,
      level: 'info',
      data: {
        method: config?.method || 'GET',
        url,
      },
    });

    // Return the fetch promise with error handling
    return originalFetch.apply(this, args).then(
      (response) => {
        // Log failed responses
        if (!response.ok) {
          Sentry.addBreadcrumb({
            category: 'http',
            message: `API Error: ${response.status} ${response.statusText}`,
            level: 'error',
            data: {
              status: response.status,
              statusText: response.statusText,
              url,
            },
          });

          // Capture as event for error responses
          if (response.status >= 500) {
            Sentry.captureMessage(
              `API Server Error: ${response.status} ${url}`,
              'error'
            );
          }
        }
        return response;
      },
      (error) => {
        // Log fetch errors
        Sentry.addBreadcrumb({
          category: 'http',
          message: `API Request Failed: ${error.message}`,
          level: 'error',
          data: {
            error: error.message,
            url,
          },
        });

        Sentry.captureException(error, {
          contexts: {
            http: {
              url,
              method: config?.method || 'GET',
            },
          },
        });

        throw error;
      }
    );
  };
}

/**
 * Utility to add context to Sentry for authentication
 */
export function setSentryUserContext(user: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    custom_role: user.role,
  });
}

/**
 * Utility to clear Sentry user context on logout
 */
export function clearSentryUserContext() {
  Sentry.setUser(null);
}

/**
 * Capture Supabase-specific errors
 */
export function captureSupabaseError(error: any, context?: string) {
  Sentry.captureException(error, {
    contexts: {
      supabase: {
        context: context || 'Unknown',
        code: error?.code,
        message: error?.message,
        details: error?.details,
      },
    },
    tags: {
      service: 'supabase',
      context: context || 'unknown',
    },
  });
}

/**
 * Capture user interactions as breadcrumbs
 */
export function trackUserAction(action: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data,
  });
}




