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
import { Company } from "@/data/companyMockData";
import { Users, AlertCircle } from "lucide-react";
import { companyToasts } from "@/data/companyToastMessages";
import { useTranslation } from 'react-i18next';

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
  const [newLimit, setNewLimit] = useState(company.seatLimit);

  const handleSubmit = () => {
    if (newLimit < company.seatUsed) {
      companyToasts.actionFailed(t('company:errors.seatLimitTooLow'));
      return;
    }
    onUpdate(newLimit);
    companyToasts.settingsSaved();
    onOpenChange(false);
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
              {company.seatLimit} vagas
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Vagas em Uso</Label>
            <div className="text-lg">
              {company.seatUsed} de {company.seatLimit}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-limit">Novo Limite</Label>
            <Input
              id="new-limit"
              type="number"
              min={company.seatUsed}
              value={newLimit}
              onChange={(e) => setNewLimit(parseInt(e.target.value))}
            />
          </div>

          {newLimit < company.seatUsed && (
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
          <Button onClick={handleSubmit} disabled={newLimit < company.seatUsed}>
            Atualizar Limite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
