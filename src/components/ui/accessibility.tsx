import React from 'react';
import { cn } from '@/lib/utils';

// Skip to main content link
export const SkipLink: React.FC<{ href?: string; children?: React.ReactNode }> = ({ 
  href = '#main-content', 
  children = 'Saltar para o conteúdo principal' 
}) => (
  <a
    href={href}
    className="skip-link"
  >
    {children}
  </a>
);

// Screen reader only text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Focus trap for modals and dialogs
export const FocusTrap: React.FC<{ 
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}> = ({ children, enabled = true, className }) => {
  const trapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled || !trapRef.current) return;

    const trap = trapRef.current;
    const focusableElements = trap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [enabled]);

  return (
    <div ref={trapRef} className={className}>
      {children}
    </div>
  );
};

// Announce changes to screen readers
export const useAnnounce = () => {
  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return announce;
};

// High contrast mode detector
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
};

// Reduced motion detector
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Enhanced button with proper ARIA attributes
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}> = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  loadingText = 'A carregar...',
  ariaLabel,
  ariaDescribedBy,
  className,
  variant = 'primary'
}) => {
  const variants = {
    primary: 'bg-bright-royal text-white hover:bg-bright-royal/90',
    secondary: 'bg-vibrant-blue text-white hover:bg-vibrant-blue/90',
    ghost: 'bg-transparent text-deep-navy hover:bg-slate-grey/10'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
    >
      {loading ? loadingText : children}
    </button>
  );
};