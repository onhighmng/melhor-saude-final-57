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
    <div className="min-h-screen relative overflow-hidden">
      {/* Blue gradient background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 900\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23F0F9FF;stop-opacity:1\' /%3E%3Cstop offset=\'20%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'40%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'60%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'80%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230EA5E9;stop-opacity:1\' /%3E%3C/linearGradient%3E%3CradialGradient id=\'highlight\' cx=\'50%25\' cy=\'20%25\' r=\'60%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0.3\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23blueGrad)\'/%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23highlight)\'/%3E%3C/svg%3E")'
        }}
      ></div>

      <div className="relative z-10 space-y-6">
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
    </div>
  );
}
