import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  variant?: 'dots' | 'line' | 'numbers';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  variant = 'dots',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: { indicator: 'w-6 h-6', text: 'text-sm', line: 'h-0.5' },
    md: { indicator: 'w-8 h-8', text: 'text-base', line: 'h-1' },
    lg: { indicator: 'w-10 h-10', text: 'text-lg', line: 'h-1.5' }
  };

  const currentSizes = sizeClasses[size];

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-2', className)}>
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'rounded-full transition-all duration-300',
              currentSizes.indicator,
              index <= currentStep
                ? 'bg-bright-royal shadow-glow'
                : 'bg-slate-grey/30'
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <span
              key={index}
              className={cn(
                'transition-colors duration-300',
                currentSizes.text,
                index <= currentStep ? 'text-bright-royal font-semibold' : 'text-slate-grey'
              )}
            >
              {step}
            </span>
          ))}
        </div>
        <div className={cn('w-full bg-slate-grey/20 rounded-full', currentSizes.line)}>
          <div
            className={cn(
              'bg-gradient-to-r from-bright-royal to-vibrant-blue rounded-full transition-all duration-500 ease-out',
              currentSizes.line
            )}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // Numbers variant
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'rounded-full flex items-center justify-center border-2 transition-all duration-300',
                currentSizes.indicator,
                index < currentStep
                  ? 'bg-bright-royal border-bright-royal text-white'
                  : index === currentStep
                  ? 'bg-bright-royal border-bright-royal text-white shadow-glow'
                  : 'bg-white border-slate-grey/30 text-slate-grey'
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                'mt-2 text-center max-w-20 transition-colors duration-300',
                currentSizes.text,
                index <= currentStep ? 'text-bright-royal font-semibold' : 'text-slate-grey'
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 mx-4 rounded-full transition-colors duration-300',
                currentSizes.line,
                index < currentStep ? 'bg-bright-royal' : 'bg-slate-grey/30'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressIndicator;