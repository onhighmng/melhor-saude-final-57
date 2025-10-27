import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Company } from "@/types/company";
import { Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";

interface SeatAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  onUpdate: (newLimit: number) => void;
}

export function SeatAllocationModal({ 
  open, 
  onOpenChange, 
  company,
  onUpdate 
}: SeatAllocationModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [newLimit, setNewLimit] = useState(company.sessions_allocated || 0);

  const handleSubmit = async () => {
    if (newLimit < (company.sessions_used || 0)) {
      toast({
        title: 'Erro',
        description: t('company:errors.seatLimitTooLow'),
        variant: 'destructive'
      });
      return;
    }

    try {
      // Update company sessions_allocated
      await supabase
        .from('companies')
        .update({ sessions_allocated: newLimit })
        .eq('id', company.id);

      // Log admin action
      if (profile?.id) {
        await supabase.from('admin_logs').insert({
          admin_id: profile.id,
          action: 'sessions_allocated',
          entity_type: 'company',
          entity_id: company.id,
          details: { 
            previous_allocation: company.sessions_allocated || 0,
            new_allocation: newLimit,
            change: newLimit - (company.sessions_allocated || 0)
          }
        });
      }

      onUpdate(newLimit);
      
      toast({
        title: 'Limite atualizado',
        description: 'As alterações foram guardadas com sucesso.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar limite',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rever Alocação de Vagas
          </DialogTitle>
          <DialogDescription>
            Ajuste o limite de contas ativas para a empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Limite Atual</Label>
            <div className="text-2xl font-bold text-bright-royal">
              {company.sessions_allocated || 0} vagas
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Vagas em Uso</Label>
            <div className="text-lg">
              {company.sessions_used || 0} de {company.sessions_allocated || 0}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-limit">Novo Limite</Label>
            <Input
              id="new-limit"
              type="number"
              min={company.sessions_used || 0}
              value={newLimit}
              onChange={(e) => setNewLimit(parseInt(e.target.value))}
            />
          </div>

          {newLimit < (company.sessions_used || 0) && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">
                O novo limite não pode ser inferior ao número de vagas atualmente em uso.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={newLimit < (company.sessions_used || 0)}>
            Atualizar Limite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
