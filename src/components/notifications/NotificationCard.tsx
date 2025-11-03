import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertCircle, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

const iconMap: Record<string, any> = {
  quota_warning: AlertCircle,
  booking_confirmation: Check,
  feedback_request: Star,
  session_reminder: Calendar,
  info: Bell,
};

const colorMap: Record<string, string> = {
  quota_warning: 'text-amber-500',
  booking_confirmation: 'text-green-500',
  feedback_request: 'text-blue-500',
  session_reminder: 'text-purple-500',
  info: 'text-gray-500',
};

const ctaMap: Record<string, string> = {
  quota_warning: 'Renovar Plano',
  booking_confirmation: 'Ver Detalhes',
  feedback_request: 'Enviar Feedback',
  session_reminder: 'Entrar na Sessão',
  info: 'Ver Detalhes',
};

export function NotificationCard({ notification, onMarkRead, onAction }: NotificationCardProps) {
  const Icon = iconMap[notification.type] || Bell;
  const colorClass = colorMap[notification.type] || 'text-gray-500';
  const ctaText = ctaMap[notification.type] || 'Ver Detalhes';
  
  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        !notification.read && "border-primary/30 bg-primary/5"
      )}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className={cn("mt-0.5", colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-semibold text-base">{notification.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
              </div>
              {!notification.read && (
                <Badge variant="default" className="shrink-0 ml-4">Nova</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).replace(',', ', ')}
                </span>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notification.id)}
                    className="text-xs h-auto p-0 font-medium text-gray-600 hover:text-gray-900"
                  >
                    Marcar como lida
                  </Button>
                )}
              </div>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction(notification)}
                className="ml-8"
              >
                {ctaText}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
