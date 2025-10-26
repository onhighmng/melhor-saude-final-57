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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

interface ReassignProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProvider: { id: string; name: string };
  availableProviders: { id: string; name: string; specialty: string }[];
  onReassign: (newProviderId: string) => void;
  bookingId: string;
}

export function ReassignProviderModal({ 
  open, 
  onOpenChange, 
  currentProvider,
  availableProviders,
  onReassign,
  bookingId 
}: ReassignProviderModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const handleSubmit = async () => {
    if (!selectedProviderId) return;
    
    try {
      // Update booking with new prestador_id
      await supabase
        .from('bookings')
        .update({ prestador_id: selectedProviderId })
        .eq('id', bookingId);

      onReassign(selectedProviderId);
      
      toast({
        title: 'Prestador reatribuído',
        description: 'O prestador foi alterado com sucesso.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao reatribuir prestador',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Reatribuir Prestador
          </DialogTitle>
          <DialogDescription>
            Selecione um novo prestador para este colaborador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Prestador Atual</Label>
            <div className="text-sm font-medium">{currentProvider.name}</div>
          </div>

          <div className="grid gap-3">
            <Label>Novo Prestador</Label>
            <RadioGroup value={selectedProviderId} onValueChange={setSelectedProviderId}>
              {availableProviders.map((provider) => (
                <div key={provider.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={provider.id} id={provider.id} />
                  <Label htmlFor={provider.id} className="cursor-pointer flex-1">
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-sm text-muted-foreground">{provider.specialty}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedProviderId}>
            Reatribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
