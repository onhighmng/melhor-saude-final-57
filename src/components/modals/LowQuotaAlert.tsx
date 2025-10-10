import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface LowQuotaAlertProps {
  open: boolean;
  onClose: () => void;
  onBookSession: () => void;
  remainingSessions: number;
}

export function LowQuotaAlert({ open, onClose, onBookSession, remainingSessions }: LowQuotaAlertProps) {
  const { t } = useTranslation('user');
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            {t('crossFlow.lowQuotaTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            Restam apenas {remainingSessions} {remainingSessions === 1 ? 'sessão' : 'sessões'}.
            <br />
            {t('crossFlow.lowQuotaMessage')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button onClick={onBookSession} className="w-full" size="lg">
            {t('crossFlow.lowQuotaCTA')}
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            {t('crossFlow.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
