/**
 * Global Error Monitor Component
 * Catches unhandled errors and provides user feedback
 */

import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/utils/errorHandler';

export const ErrorMonitor: React.FC = () => {
  useEffect(() => {
    // Global error handler for unhandled JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      logError(new Error(event.message), {
        component: 'GlobalErrorHandler',
        action: 'UNHANDLED_ERROR',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });

      // Show user-friendly toast
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro. A página irá tentar recuperar automaticamente.",
        variant: "destructive"
      });
    };

    // Global handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'GlobalErrorHandler',
          action: 'UNHANDLED_PROMISE_REJECTION'
        }
      );

      // Show user-friendly toast
      toast({
        title: "Erro de Operação",
        description: "Uma operação falhou inesperadamente. Por favor, tente novamente.",
        variant: "destructive"
      });

      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

/**
 * Higher-order component to wrap components with error monitoring
 */
export const withErrorMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const ComponentWithErrorMonitoring = (props: P) => {
    return (
      <>
        <ErrorMonitor />
        <WrappedComponent {...props} />
      </>
    );
  };

  ComponentWithErrorMonitoring.displayName = `withErrorMonitoring(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithErrorMonitoring;
};