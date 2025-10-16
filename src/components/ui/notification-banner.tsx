import React from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';

export const NotificationBanner: React.FC = () => {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isSupported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-md shadow-lg border-primary/20 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Ativar Notificações</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Receba notificações sobre confirmações de consultas, lembretes e atualizações importantes.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={requestPermission}>
                Ativar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
                Agora não
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="p-1"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};