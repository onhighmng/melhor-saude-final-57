import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useState } from "react";

interface ConsentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consents: {
    dataProcessing: boolean;
    wellnessCommunications: boolean;
    anonymousReports: boolean;
  };
  onSave: (consents: any) => void;
}

export const ConsentsModal = ({ isOpen, onClose, consents, onSave }: ConsentsModalProps) => {
  const [localConsents, setLocalConsents] = useState(consents);

  const handleSave = () => {
    onSave(localConsents);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Consentimentos</h2>
              <p className="text-sm text-muted-foreground">Gerir os seus consentimentos para tratamento de dados</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  id="consent-data"
                  checked={localConsents.dataProcessing}
                  onCheckedChange={(checked) => setLocalConsents({ ...localConsents, dataProcessing: checked as boolean })}
                  disabled
                />
                <div className="space-y-1">
                  <Label htmlFor="consent-data" className="text-base font-medium">
                    Consentimento para tratamento de dados pessoais
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Obrigatório para o funcionamento da plataforma.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  id="consent-wellness"
                  checked={localConsents.wellnessCommunications}
                  onCheckedChange={(checked) => setLocalConsents({ ...localConsents, wellnessCommunications: checked as boolean })}
                />
                <div className="space-y-1">
                  <Label htmlFor="consent-wellness" className="text-base font-medium">
                    Consentimento para comunicações de bem-estar
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber dicas e conteúdos sobre saúde e bem-estar.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  id="consent-anonymous"
                  checked={localConsents.anonymousReports}
                  onCheckedChange={(checked) => setLocalConsents({ ...localConsents, anonymousReports: checked as boolean })}
                />
                <div className="space-y-1">
                  <Label htmlFor="consent-anonymous" className="text-base font-medium">
                    Uso de dados anónimos em relatórios agregados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ajudar a melhorar os serviços através de análises agregadas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/50">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar consentimentos</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
