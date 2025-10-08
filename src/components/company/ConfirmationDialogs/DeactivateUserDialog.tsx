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
import { companyUIcopy } from "@/data/companyUIcopy";

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
}

export function DeactivateUserDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  userName 
}: DeactivateUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{companyUIcopy.deactivate.confirm}</AlertDialogTitle>
          <AlertDialogDescription>
            {companyUIcopy.deactivate.warning}
            <br />
            <br />
            <strong>Colaborador:</strong> {userName}
            <br />
            <br />
            Ao desativar, a conta ficará inacessível e libertará uma vaga.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Desativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
