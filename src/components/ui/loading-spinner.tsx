import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'current';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className, 
  color = 'primary',
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-bright-royal',
    secondary: 'text-vibrant-blue',
    white: 'text-white',
    current: 'text-current'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
      {text && (
        <span className={cn(
          'text-slate-grey font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

// Full screen loading overlay
export const LoadingOverlay: React.FC<{ 
  isVisible: boolean; 
  text?: string;
  className?: string;
}> = ({ isVisible, text = 'A carregar...', className }) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="bg-white rounded-2xl p-8 shadow-custom-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

// Inline loading state for buttons
export const ButtonLoader: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={cn('w-4 h-4 animate-spin', className)} />
);

export default LoadingSpinner;