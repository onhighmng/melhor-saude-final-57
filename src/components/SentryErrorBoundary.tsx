import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SentryErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error('Error caught by Sentry Error Boundary:', error, errorInfo);

    // Capture exception in Sentry with additional context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      const navigate = (window as any).__routerNavigate;
      if (navigate) {
        navigate('/');
      } else {
        window.location.href = '/';
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-soft-white">
          <div className="bg-white rounded-2xl p-8 shadow-custom-lg border border-slate-grey/20 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-2xl font-semibold text-deep-navy mb-3">
              Algo Correu Mal
            </h2>

            <p className="text-slate-grey mb-6 leading-relaxed">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e investigará o problema.
            </p>

            {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-grey mb-2 font-medium">
                  Detalhes do Erro
                </summary>
                <pre className="text-xs bg-slate-grey/10 p-3 rounded overflow-auto max-h-32 font-mono">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Tentar Novamente
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2 bg-slate-grey/10 text-slate-grey rounded-lg hover:bg-slate-grey/20 transition-colors font-medium"
              >
                Ir para Início
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-slate-grey mt-4">
                ID do erro: Será rastreado no Sentry
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Sentry.withErrorBoundary(SentryErrorBoundary, {
  fallback: <div>Erro ao carregar a página</div>,
  showDialog: true,
});
