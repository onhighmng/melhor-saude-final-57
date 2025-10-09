import { NotificationCard, Notification } from "./NotificationCard";
import { useTranslation } from 'react-i18next';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onAction: (notification: Notification) => void;
}

export function NotificationList({ notifications, onMarkRead, onAction }: NotificationListProps) {
  const { t } = useTranslation('user');
  
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('notifications.emptyState')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
