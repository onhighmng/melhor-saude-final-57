import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Clock, FileText } from 'lucide-react';

interface SessionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSave: (notes: string, outcome: string) => void;
}

export const SessionNoteModal = ({ isOpen, onClose, session, onSave }: SessionNoteModalProps) => {
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');

  const handleSave = () => {
    onSave(notes, outcome);
    setNotes('');
    setOutcome('');
    onClose();
  };

  const getPillarLabel = (pillar: string) => {
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || pillar;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Adicionar Nota Interna
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{session.user_name}</span>
              <Badge variant="outline">{session.company_name}</Badge>
              <Badge variant="secondary">{getPillarLabel(session.pillar)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Data:</strong> {session.date} às {session.time}</p>
              <p><strong>Tipo:</strong> {session.type}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas Internas</label>
            <Textarea
              placeholder="Descreva o que foi discutido na sessão, observações importantes, próximos passos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Estas notas são confidenciais e apenas visíveis para especialistas
            </p>
          </div>

          {/* Outcome Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Resultado da Sessão</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={outcome === 'resolved' ? 'default' : 'outline'}
                onClick={() => setOutcome('resolved')}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm font-medium">Resolvido</span>
                <span className="text-xs text-muted-foreground">
                  Caso fechado
                </span>
              </Button>
              <Button
                variant={outcome === 'escalated' ? 'default' : 'outline'}
                onClick={() => setOutcome('escalated')}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <ArrowRight className="h-6 w-6" />
                <span className="text-sm font-medium">Encaminhar</span>
                <span className="text-xs text-muted-foreground">
                  Para prestador
                </span>
              </Button>
              <Button
                variant={outcome === 'follow_up' ? 'default' : 'outline'}
                onClick={() => setOutcome('follow_up')}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Clock className="h-6 w-6" />
                <span className="text-sm font-medium">Follow-up</span>
                <span className="text-xs text-muted-foreground">
                  Nova sessão
                </span>
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!notes || !outcome}>
              Guardar Nota
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
