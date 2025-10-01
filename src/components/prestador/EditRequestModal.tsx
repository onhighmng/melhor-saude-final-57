
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { changeRequestService } from "@/services/changeRequestService";

interface EditRequest {
  field: string;
  fieldLabel: string;
  currentValue: string;
  prestadorId?: string;
  prestadorName?: string;
}

interface EditRequestModalProps {
  editRequest: EditRequest;
  onClose: () => void;
}

const EditRequestModal = ({ editRequest, onClose }: EditRequestModalProps) => {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setNewValue(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await changeRequestService.createChangeRequest({
        prestadorId: editRequest.prestadorId || '1', // In real app, get from context/props
        prestadorName: editRequest.prestadorName || 'Prestador', // In real app, get from context/props
        field: editRequest.field,
        fieldLabel: editRequest.fieldLabel,
        currentValue: editRequest.currentValue,
        requestedValue: newValue,
        reason: reason || undefined
      });

      toast({
        title: "Solicitação enviada com sucesso!",
        description: "A sua solicitação de alteração foi enviada para análise pelo administrador.",
      });

      onClose();
    } catch (error) {
      console.error('Error creating change request:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-navy-blue">
            Solicitar Alteração - {editRequest.fieldLabel}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current" className="text-navy-blue">Valor Atual</Label>
            <div className="mt-1 p-3 bg-cool-grey/20 rounded-md">
              {editRequest.field === 'photo' ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={editRequest.currentValue} 
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-navy-blue opacity-80">Foto atual</span>
                </div>
              ) : (
                <p className="text-sm text-navy-blue opacity-80">
                  {editRequest.currentValue}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="newValue" className="text-navy-blue">
              Novo Valor
            </Label>
            {editRequest.field === 'photo' ? (
              <div className="mt-2 space-y-3">
                {imagePreview && (
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="newValue"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-royal-blue file:text-white hover:file:bg-navy-blue"
                    required
                  />
                  <Upload className="w-4 h-4 text-navy-blue" />
                </div>
              </div>
            ) : editRequest.field === 'fullBio' || editRequest.field === 'specialties' ? (
              <Textarea
                id="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Insira o novo valor para ${editRequest.fieldLabel.toLowerCase()}`}
                className="mt-1"
                required
              />
            ) : (
              <Input
                id="newValue"
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Insira o novo valor para ${editRequest.fieldLabel.toLowerCase()}`}
                className="mt-1"
                required
              />
            )}
          </div>

          <div>
            <Label htmlFor="reason" className="text-navy-blue">
              Motivo da Alteração (Opcional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique brevemente o motivo desta alteração..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-royal-blue text-white hover:bg-navy-blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Solicitar Alteração'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRequestModal;
