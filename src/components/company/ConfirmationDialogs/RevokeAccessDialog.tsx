import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from "lucide-react";

interface RevokeAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
}

export function RevokeAccessDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  userName 
}: RevokeAccessDialogProps) {
  const { t } = useTranslation('company');
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('revokeAccess.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-destructive">
              {t('revokeAccess.warning')}
            </strong>
            <br />
            <br />
            {t('revokeAccess.confirm')}
            <br />
            <br />
            <strong>{t('revokeAccess.employeeLabel')}</strong> {userName}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('employees.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('revokeAccess.action')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
