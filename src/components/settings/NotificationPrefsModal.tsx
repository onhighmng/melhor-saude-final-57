import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { useState } from "react";

interface NotificationPrefsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: {
    emailConfirmation: boolean;
    pushNotification: boolean;
    reminder24h: boolean;
    feedbackReminder: boolean;
  };
  onSave: (prefs: any) => void;
}

export const NotificationPrefsModal = ({ isOpen, onClose, preferences, onSave }: NotificationPrefsModalProps) => {
  const [prefs, setPrefs] = useState(preferences);

  const handleSave = () => {
    onSave(prefs);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0" showClose={false} aria-describedby="notif-prefs-description">
        <DialogTitle className="sr-only">Preferências de Notificação</DialogTitle>
        <DialogDescription id="notif-prefs-description" className="sr-only">
          Gerir como quer ser notificado
        </DialogDescription>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Preferências de Notificação</h2>
              <p className="text-sm text-muted-foreground">Gerir como quer ser notificado</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Email de confirmação de sessão</Label>
                  <p className="text-sm text-muted-foreground">Receber email quando uma sessão for confirmada</p>
                </div>
                <Switch
                  checked={prefs.emailConfirmation}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, emailConfirmation: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Notificação push</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações push no dispositivo</p>
                </div>
                <Switch
                  checked={prefs.pushNotification}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, pushNotification: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Lembrete 24h antes da sessão</Label>
                  <p className="text-sm text-muted-foreground">Receber lembrete no dia anterior à sessão</p>
                </div>
                <Switch
                  checked={prefs.reminder24h}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, reminder24h: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Lembrete de feedback após sessão</Label>
                  <p className="text-sm text-muted-foreground">Receber lembrete para avaliar a sessão</p>
                </div>
                <Switch
                  checked={prefs.feedbackReminder}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, feedbackReminder: checked })}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/50">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar preferências</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
