import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  currentSessions: number;
  employeeName: string;
  onSuccess: () => void;
}

export const EditEmployeeDialog = ({ 
  open, 
  onOpenChange, 
  employeeId, 
  currentSessions,
  employeeName,
  onSuccess 
}: EditEmployeeDialogProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [sessionsAllocated, setSessionsAllocated] = useState(currentSessions);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('company_employees')
        .update({
          sessions_allocated: sessionsAllocated,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: 'Quota atualizada',
        description: `Sessões de ${employeeName} atualizadas para ${sessionsAllocated}`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar quota',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Quota de Sessões</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Colaborador</Label>
            <Input value={employeeName} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessions">Sessões Alocadas</Label>
            <Input
              id="sessions"
              type="number"
              min="0"
              value={sessionsAllocated}
              onChange={(e) => setSessionsAllocated(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
