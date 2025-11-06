import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Notification } from "@/components/notifications/NotificationCard";

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onNotificationAction: (notification: Notification) => void;
}

export const NotificationHistoryModal = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onNotificationAction
}: NotificationHistoryModalProps) => {
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col" showClose={false} aria-describedby="notif-history-description">
        <DialogHeader>
          <DialogTitle>Histórico de Notificações</DialogTitle>
          <DialogDescription id="notif-history-description">
            Ver todas as suas notificações
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {unreadNotifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Não Lidas ({unreadNotifications.length})
              </h3>
              <NotificationList
                notifications={unreadNotifications}
                onMarkRead={onMarkRead}
                onAction={onNotificationAction}
              />
            </div>
          )}
          
          {readNotifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Lidas ({readNotifications.length})
              </h3>
              <NotificationList
                notifications={readNotifications}
                onMarkRead={onMarkRead}
                onAction={onNotificationAction}
              />
            </div>
          )}
          
          {notifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Sem notificações
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
