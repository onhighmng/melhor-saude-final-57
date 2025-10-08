import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneBadgeProps {
  label: string;
  completed: boolean;
}

export const MilestoneBadge = ({ label, completed }: MilestoneBadgeProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
        completed 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted border-2 border-muted-foreground/30"
      )}>
        {completed && <Check className="h-4 w-4" />}
      </div>
      <span className={cn(
        "text-sm",
        completed ? "font-medium" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};
