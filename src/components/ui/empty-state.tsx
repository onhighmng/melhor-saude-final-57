import { Button } from "@/components/ui/button";
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode | LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'compact';
}

export const EmptyState = ({ 
  icon: IconOrElement, 
  title, 
  description, 
  action,
  className,
  variant = 'default'
}: EmptyStateProps) => {
  const renderIcon = () => {
    if (!IconOrElement) return null;
    
    // Check if it's a Lucide icon component
    if (typeof IconOrElement === 'function') {
      const Icon = IconOrElement as LucideIcon;
      return <Icon className={variant === 'compact' ? "h-10 w-10" : "h-12 w-12"} />;
    }
    
    // Otherwise render as React element
    return IconOrElement;
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <div className="text-muted-foreground/30 mb-3">
          {renderIcon()}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">{description}</p>
        {action && (
          <Button 
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      {IconOrElement && (
        <div className="rounded-full bg-muted/50 p-6 mb-4 text-muted-foreground/50">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
};

