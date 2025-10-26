import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Clock, FileText, MessageSquare } from 'lucide-react';
import { ReferralBookingFlow } from './ReferralBookingFlow';
import { PreDiagnosticModal } from './PreDiagnosticModal';
import { useToast } from '@/hooks/use-toast';

interface SessionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSave: (notes: string, outcome: string) => void;
}

export const SessionNoteModal = ({ isOpen, onClose, session, onSave }: SessionNoteModalProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [showReferralFlow, setShowReferralFlow] = useState(false);
  const [showPreDiagnostic, setShowPreDiagnostic] = useState(false);

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

  const getSessionTypeLabel = (type: string) => {
    const types = {
      video: 'Virtual',
      online: 'Virtual',
      presencial: 'Presencial',
      'in-person': 'Presencial',
      phone: 'Chamada Telefónica',
      'phone-call': 'Chamada Telefónica',
      call: 'Chamada Telefónica'
    };
    return types[type?.toLowerCase() as keyof typeof types] || 'Virtual';
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
          {/* Session Info and Notes - Side by Side */}
          <div className="grid grid-cols-3 gap-4">
            {/* Session Info - Left */}
            <div className="col-span-1 p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{session.user_name}</span>
                <Badge variant="outline">{session.company_name}</Badge>
                <Badge variant="secondary">{getPillarLabel(session.pillar)}</Badge>
              </div>
              <div className="text-sm text-foreground">
                <p><strong>Data:</strong> {session.date} às {session.time}</p>
                <p><strong>Tipo:</strong> {getSessionTypeLabel(session.session_type || session.type)}</p>
              </div>
            </div>

            {/* Notes - Right */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Notas Internas</label>
              <Textarea
                placeholder="Descreva o que foi discutido na sessão, observações importantes, próximos passos..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-foreground">
                Estas notas são confidenciais e apenas visíveis para especialistas
              </p>
            </div>
          </div>

          {/* Outcome Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Resultado da Sessão</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={outcome === 'resolved' ? 'default' : 'outline'}
                onClick={() => {
                  setOutcome('resolved');
                  handleSave();
                }}
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
                onClick={() => {
                  setOutcome('escalated');
                  setShowReferralFlow(true);
                }}
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
                onClick={() => setShowPreDiagnostic(true)}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm font-medium">Ver Pré-Diagnóstico</span>
                <span className="text-xs text-muted-foreground">
                  Transcrição completa
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

      {/* Referral Booking Flow */}
      <ReferralBookingFlow
        isOpen={showReferralFlow}
        onClose={() => setShowReferralFlow(false)}
        sessionPillar={session?.pillar}
        userName={session?.user_name || ''}
        userId={session?.user_id || ''}
        onBookingComplete={(prestadorId, date, referralNotes) => {
          toast({
            title: 'Encaminhamento Confirmado',
            description: `Sessão agendada para ${date.toLocaleDateString('pt-PT')} às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
          });
          setShowReferralFlow(false);
        }}
      />

      {/* Pre-Diagnostic Modal */}
      <PreDiagnosticModal
        open={showPreDiagnostic}
        onOpenChange={setShowPreDiagnostic}
        session={{
          chat_session_id: session?.chat_session_id,
          user_name: session?.user_name || '',
          company_name: session?.company_name || '',
          pillar: session?.pillar || '',
          date: session?.date || '',
          time: session?.time || '',
          topic: session?.topic
        }}
      />
    </Dialog>
  );
};
