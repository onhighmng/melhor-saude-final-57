import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Session {
  id: string;
  user_name: string;
  company_name: string;
  pillar: string;
  date: string;
  time: string;
  notes?: string;
}

interface SessionNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onSave: (sessionId: string, notes: string) => void;
}

const pillarLabels: Record<string, string> = {
  psychological: 'Psicológico',
  financial: 'Financeiro',
  legal: 'Jurídico',
  physical: 'Físico',
};

export const SessionNoteModal: React.FC<SessionNoteModalProps> = ({
  open,
  onOpenChange,
  session,
  onSave,
}) => {
  const [notes, setNotes] = useState(session?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (session) {
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!session) return;

    if (!notes.trim()) {
      toast({
        title: 'Notas Obrigatórias',
        description: 'Por favor, adicione notas sobre a sessão.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      await onSave(session.id, notes);
      
      toast({
        title: 'Notas Guardadas',
        description: 'As notas da sessão foram guardadas com sucesso.',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao Guardar',
        description: 'Não foi possível guardar as notas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Notas da Sessão
          </DialogTitle>
          <DialogDescription>
            Adicione observações internas sobre a sessão com {session.user_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{session.user_name}</p>
                <p className="text-sm text-muted-foreground">{session.company_name}</p>
              </div>
              <Badge variant="secondary">
                {pillarLabels[session.pillar] || session.pillar}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {session.date} às {session.time}
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="session-notes" className="text-base">
              Notas Internas *
            </Label>
            <p className="text-sm text-muted-foreground">
              Estas notas são confidenciais e apenas visíveis para a equipa da Melhor Saúde.
              Descreva o que foi discutido, ações tomadas e recomendações para o futuro.
            </p>
            <Textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Exemplo: Colaborador demonstrou progresso significativo desde a última sessão. Discutimos técnicas de gestão de stress e estabelecemos metas para as próximas duas semanas. Recomendo acompanhamento quinzenal..."
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {notes.length} caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !notes.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'A guardar...' : 'Guardar Notas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
