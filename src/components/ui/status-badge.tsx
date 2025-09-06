import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SessionStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

const statusConfig = {
  scheduled: { 
    label: 'Agendada', 
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' 
  },
  confirmed: { 
    label: 'Confirmada', 
    className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' 
  },
  'in-progress': { 
    label: 'Em curso', 
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200' 
  },
  completed: { 
    label: 'Concluída', 
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200' 
  },
  cancelled: { 
    label: 'Cancelada', 
    className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' 
  },
  'no-show': { 
    label: 'Falta', 
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200' 
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.scheduled;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium px-3 py-1 text-sm border',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}