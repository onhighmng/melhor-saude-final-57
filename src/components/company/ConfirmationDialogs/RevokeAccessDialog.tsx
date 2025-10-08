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
import { companyUIcopy } from "@/data/companyUIcopy";
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
            {companyUIcopy.revokeAccess.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-destructive">
              {companyUIcopy.revokeAccess.warning}
            </strong>
            <br />
            <br />
            {companyUIcopy.revokeAccess.confirm}
            <br />
            <br />
            <strong>Colaborador:</strong> {userName}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('employees.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Revogar Acesso
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
