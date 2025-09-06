import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

const createToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  options: ToastOptions = {}
) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-green" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    warning: <AlertTriangle className="w-5 h-5 text-warm-orange" />,
    info: <Info className="w-5 h-5 text-vibrant-blue" />
  };

  const colors = {
    success: 'border-l-emerald-green bg-emerald-green/5',
    error: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-warm-orange bg-warm-orange/5',
    info: 'border-l-vibrant-blue bg-vibrant-blue/5'
  };

  return sonnerToast.custom(
    (t) => (
      <div className={`
        ${colors[type]} 
        border-l-4 bg-white rounded-lg shadow-custom-lg p-4 min-w-[320px] max-w-md
        hover-lift transition-smooth
      `}>
        <div className="flex items-start gap-3">
          {icons[type]}
          <div className="flex-1 min-w-0">
            {options.title && (
              <div className="font-semibold text-deep-navy mb-1">
                {options.title}
              </div>
            )}
            <div className="text-slate-grey leading-relaxed">
              {message}
            </div>
            {options.description && (
              <div className="text-sm text-slate-grey/80 mt-1">
                {options.description}
              </div>
            )}
            {options.action && (
              <button
                onClick={() => {
                  options.action?.onClick();
                  sonnerToast.dismiss(t);
                }}
                className="mt-3 text-sm font-medium text-bright-royal hover:text-bright-royal/80 transition-colors"
              >
                {options.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              sonnerToast.dismiss(t);
              options.onDismiss?.();
            }}
            className="text-slate-grey hover:text-deep-navy transition-colors p-1 -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ),
    {
      duration: options.duration || 4000,
    }
  );
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    createToast('success', message, options),
  
  error: (message: string, options?: ToastOptions) =>
    createToast('error', message, options),
  
  warning: (message: string, options?: ToastOptions) =>
    createToast('warning', message, options),
  
  info: (message: string, options?: ToastOptions) =>
    createToast('info', message, options),

  // Quick success messages
  saved: () => toast.success('Alterações guardadas com sucesso!'),
  deleted: () => toast.success('Item removido com sucesso!'),
  copied: () => toast.success('Copiado para a área de transferência!'),
  
  // Quick error messages  
  networkError: () => toast.error('Erro de conexão. Tente novamente.'),
  validationError: (field: string) => toast.error(`Por favor, verifique o campo ${field}.`),
  permissionError: () => toast.error('Não tem permissão para esta ação.'),

  // Loading toast with promise
  promise: <T,>(
    promise: Promise<T>,
    {
      loading = 'A processar...',
      success = 'Concluído com sucesso!',
      error = 'Ocorreu um erro.'
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    } = {}
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  }
};

export default toast;