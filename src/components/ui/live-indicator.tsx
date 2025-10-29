import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  className?: string;
}

export const LiveIndicator = ({ className }: LiveIndicatorProps) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
      </span>
      <span className="text-xs font-medium">Tempo Real</span>
    </Badge>
  );
};
