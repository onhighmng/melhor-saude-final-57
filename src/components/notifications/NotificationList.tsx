import { NotificationCard, Notification } from "./NotificationCard";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onAction: (notification: Notification) => void;
}

export function NotificationList({ notifications, onMarkRead, onAction }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sem notificações</p>
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
