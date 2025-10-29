import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'table' | 'list' | 'stats' | 'text';
  count?: number;
}

export const LoadingSkeleton = ({ 
  className, 
  variant = 'card',
  count = 1 
}: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn("rounded-lg border bg-card p-6 space-y-4 animate-pulse", className)}>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        );
      
      case 'table':
        return (
          <div className={cn("rounded-md border", className)}>
            <div className="p-4 border-b bg-muted/50 animate-pulse">
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b last:border-0 space-y-3 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-3 bg-muted rounded flex-1"></div>
                  <div className="h-3 bg-muted rounded flex-1"></div>
                  <div className="h-3 bg-muted rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-card animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'stats':
        return (
          <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 space-y-3 animate-pulse">
                <div className="h-3 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className={cn("space-y-2 animate-pulse", className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full"></div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderSkeleton();
};
