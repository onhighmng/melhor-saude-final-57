import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  return (
    <Badge 
      variant="destructive" 
      className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
    >
      {count > 9 ? '9+' : count}
    </Badge>
  );
}
