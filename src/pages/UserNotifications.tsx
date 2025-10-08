import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Notification } from "@/components/notifications/NotificationCard";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export default function UserNotifications() {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  
  // Mock notifications data - using translation keys for display
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'session_reminder',
      title: t('notifications.mockNotifications.sessionToday.title'),
      message: t('notifications.mockNotifications.sessionToday.message', { provider: 'Dr. João Silva', time: '14:00' }),
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/user/sessions',
      sessionId: 'sess-1',
    },
    {
      id: 'notif-2',
      type: 'feedback_request',
      title: t('notifications.mockNotifications.rateSession.title'),
      message: t('notifications.mockNotifications.rateSession.message', { provider: 'Dra. Maria Santos' }),
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sessionId: 'sess-2',
    },
    {
      id: 'notif-3',
      type: 'quota_warning',
      title: t('notifications.mockNotifications.quotaExpiring.title'),
      message: t('notifications.mockNotifications.quotaExpiring.message', { count: 2 }),
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'notif-4',
      type: 'booking_confirmation',
      title: t('notifications.mockNotifications.sessionConfirmed.title'),
      message: t('notifications.mockNotifications.sessionConfirmed.message', { date: '25 de Março', time: '10:00' }),
      read: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      sessionId: 'sess-3',
    },
    {
      id: 'notif-5',
      type: 'info',
      title: t('notifications.mockNotifications.newResources.title'),
      message: t('notifications.mockNotifications.newResources.message'),
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
    toast.success(t('notifications.markedAsRead'));
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
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        icon={Bell}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread">
              {t('notifications.tabs.unread', { count: unreadNotifications.length })}
            </TabsTrigger>
            <TabsTrigger value="all">
              {t('notifications.tabs.all', { count: notifications.length })}
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
