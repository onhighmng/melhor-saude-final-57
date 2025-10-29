import { toast } from 'sonner';

interface ErrorHandlerOptions {
  title?: string;
  fallbackMessage?: string;
  showToast?: boolean;
  logToConsole?: boolean;
}

/**
 * Centralized error handler for consistent error messaging
 */
export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
) => {
  const {
    title = 'Erro',
    fallbackMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    showToast = true,
    logToConsole = true
  } = options;

  // Extract error message
  let errorMessage = fallbackMessage;
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  // Log to console if enabled
  if (logToConsole) {
    console.error(`[${title}]`, error);
  }

  // Show toast notification if enabled
  if (showToast) {
    toast.error(title, {
      description: errorMessage,
      duration: 5000,
    });
  }

  return errorMessage;
};

/**
 * Log error for debugging without showing toast
 */
export const logError = (error: unknown, context?: string) => {
  console.error(context ? `[${context}]` : 'Error:', error);
};

/**
 * Success toast with consistent styling
 */
export const showSuccess = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 3000,
  });
};

/**
 * Info toast with consistent styling
 */
export const showInfo = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 4000,
  });
};

/**
 * Warning toast with consistent styling
 */
export const showWarning = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    duration: 4000,
  });
};