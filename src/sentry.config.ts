import * as Sentry from '@sentry/react';

// Initialize Sentry with comprehensive configuration
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.MODE,
  release: `melhor-saude@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
  
  // Performance Monitoring
  tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
    ? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE)
    : 1.0,
  
  // Error filtering
  ignoreErrors: [
    // Random plugins/extensions
    'top\.GLOBALS',
    // Chrome extensions
    'chrome-extension://',
    'moz-extension://',
    // Firefox extensions
    'firefox:',
  ],
  
  // Denylist - don't send errors from these URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
  ],
  
  // General settings
  enabled: import.meta.env.VITE_SENTRY_ENABLED !== 'false',
  debug: import.meta.env.DEV,
  
  // Attach stack traces to all messages
  attachStacktrace: true,
  
  // Max breadcrumbs to send (default is 100)
  maxBreadcrumbs: 50,
  
  // Before sending to Sentry, sanitize sensitive data
  beforeSend(event, hint) {
    // Filter out sensitive information
    if (event.request?.url?.includes('/auth')) {
      // Remove sensitive auth URLs
      event.request.url = '[REDACTED]';
    }
    return event;
  },
});

// Log initialization
if (import.meta.env.DEV) {
  console.log('✅ Sentry initialized:', {
    dsn: import.meta.env.VITE_SENTRY_DSN ? '✓ DSN configured' : '✗ No DSN',
    environment: import.meta.env.MODE,
    enabled: import.meta.env.VITE_SENTRY_ENABLED !== 'false',
  });
}

export default Sentry;
