/**
 * Centralized logging utility
 * Replaces console.log with environment-aware logging
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

export const logger = {
  debug: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
    
    // In production, send to monitoring service
    // Example:
    // if (import.meta.env.PROD && typeof Sentry !== 'undefined') {
    //   Sentry.captureMessage(args.join(' '), { level: 'error' });
    // }
  }
};

