import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertCircle, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface Notification {
  id: string;
  type: 'quota_warning' | 'booking_confirmation' | 'feedback_request' | 'session_reminder' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  sessionId?: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onAction: (notification: Notification) => void;
}

const iconMap = {
  quota_warning: AlertCircle,
  booking_confirmation: CheckCircle,
  feedback_request: Star,
  session_reminder: Calendar,
  info: Bell,
};

const colorMap = {
  quota_warning: 'text-amber-500',
  booking_confirmation: 'text-green-500',
  feedback_request: 'text-blue-500',
  session_reminder: 'text-purple-500',
  info: 'text-gray-500',
};

export function NotificationCard({ notification, onMarkRead, onAction }: NotificationCardProps) {
  const { t } = useTranslation('user');
  
  const Icon = iconMap[notification.type];
  const colorClass = colorMap[notification.type];
  
  const ctaMap = {
    quota_warning: t('notifications.ctaQuotaWarning'),
    booking_confirmation: t('notifications.ctaViewDetails'),
    feedback_request: t('notifications.ctaSendFeedback'),
    session_reminder: t('notifications.ctaJoinSession'),
    info: t('notifications.ctaViewDetails'),
  };
  
  const ctaText = ctaMap[notification.type];
  
  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        !notification.read && "border-primary/30 bg-primary/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={cn("mt-1", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
              {!notification.read && (
                <Badge variant="default" className="shrink-0">{t('notifications.newBadge')}</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString('pt-PT', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              
              <div className="flex gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    {t('notifications.markRead')}
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAction(notification)}
                >
                  {ctaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
