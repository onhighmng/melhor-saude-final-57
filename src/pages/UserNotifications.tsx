import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Notification } from "@/components/notifications/NotificationCard";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export default function UserNotifications() {
  const navigate = useNavigate();
  
  // Mock notifications data - using translation keys for display
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'session_reminder',
      title: 'Sessão Hoje',
      message: 'Tem uma sessão hoje às 14:00 com Dr. João Silva',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/user/sessions',
      sessionId: 'sess-1',
    },
    {
      id: 'notif-2',
      type: 'feedback_request',
      title: 'Avalie a Sessão',
      message: 'Que tal avaliar a sua sessão com Dra. Maria Santos?',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sessionId: 'sess-2',
    },
    {
      id: 'notif-3',
      type: 'quota_warning',
      title: 'Sessões a Expirar',
      message: 'Restam apenas 2 sessões. Renove o seu plano!',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'notif-4',
      type: 'booking_confirmation',
      title: 'Sessão Confirmada',
      message: 'A sua sessão foi confirmada para 25 de Março às 10:00',
      read: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      sessionId: 'sess-3',
    },
    {
      id: 'notif-5',
      type: 'info',
      title: 'Novos Recursos',
      message: 'Novos recursos de bem-estar disponíveis na sua área pessoal',
      read: true,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      actionUrl: '/user/resources',
    },
  ];
  
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  
  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast.success('Marcado como lido');
  };
  
  const handleAction = (notification: Notification) => {
    // Mark as read when taking action
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'session_reminder':
      case 'booking_confirmation':
        navigate('/user/sessions');
        break;
      case 'feedback_request':
        if (notification.sessionId) {
          navigate(`/user/feedback/${notification.sessionId}`);
        }
        break;
      case 'quota_warning':
        navigate('/user/book');
        break;
      case 'info':
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
        }
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title='Notificações'
        subtitle='Gerir as suas notificações e preferências'
        icon={Bell}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread">
              Não Lidas ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todas ({notifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread" className="mt-6">
            <NotificationList
              notifications={unreadNotifications}
              onMarkRead={handleMarkRead}
              onAction={handleAction}
            />
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            <NotificationList
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onAction={handleAction}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
