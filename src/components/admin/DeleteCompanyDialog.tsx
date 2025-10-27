import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface DeleteCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

export const DeleteCompanyDialog = ({ 
  open, 
  onOpenChange, 
  companyId, 
  companyName, 
  onSuccess 
}: DeleteCompanyDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Soft delete: deactivate company
      const { error: companyError } = await supabase
        .from('companies')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (companyError) throw companyError;

      // Deactivate all employees
      const { error: employeesError } = await supabase
        .from('company_employees')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

      if (employeesError) throw employeesError;

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'company_deleted',
        entity_id: companyId,
        entity_type: 'company',
        details: { company_name: companyName }
      });

      toast({
        title: 'Empresa eliminada',
        description: `${companyName} foi desativada com sucesso`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao eliminar empresa',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Empresa</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que deseja eliminar <strong>{companyName}</strong>?
            <br /><br />
            Esta ação irá:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Desativar a empresa</li>
              <li>Desativar todos os colaboradores associados</li>
              <li>Cancelar subscrições ativas</li>
            </ul>
            <br />
            Os dados históricos serão mantidos para fins de auditoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Empresa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
