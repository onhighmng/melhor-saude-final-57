// Error logging service for production error tracking
export interface ErrorLog {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: {
    componentStack: string;
  };
  userAgent: string;
  url: string;
  userId?: string;
  buildVersion?: string;
}

class ErrorBoundaryLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  logError(error: Error, errorInfo?: React.ErrorInfo, userId?: string) {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack,
      } : undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
      buildVersion: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    };

    // Store locally
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('errorLogs', JSON.stringify(this.logs.slice(0, 10)));
    } catch (e) {
      console.warn('Could not store error logs in localStorage');
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      if (errorInfo) {
        console.error('Error Info:', errorInfo);
      }
      console.error('Full Error Log:', errorLog);
      console.groupEnd();
    }

    // In production, you would send to error tracking service
    // this.sendToErrorTrackingService(errorLog);
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('errorLogs');
    } catch (e) {
      console.warn('Could not clear error logs from localStorage');
    }
  }

  // Load persisted logs on initialization
  loadPersistedLogs() {
    try {
      const stored = localStorage.getItem('errorLogs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.logs = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load persisted error logs');
    }
  }

  // Future: Send to external error tracking service
  private sendToErrorTrackingService(errorLog: ErrorLog) {
    // Implementation for Sentry, LogRocket, etc.
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog)
    // });
  }
}

export const errorLogger = new ErrorBoundaryLogger();

// Initialize on startup
errorLogger.loadPersistedLogs();