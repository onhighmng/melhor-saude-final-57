import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, PhoneOff, CheckCircle, ArrowRight, Clock, MessageSquare } from 'lucide-react';
import { CallRequest } from '@/types/specialist';
import { supabase } from '@/integrations/supabase/client';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CallRequest;
  onComplete: (outcome: string, notes: string) => void;
}

type CallState = 'preparing' | 'calling' | 'in_call' | 'ending';

export const CallModal = ({ isOpen, onClose, request, onComplete }: CallModalProps) => {
  const [callState, setCallState] = useState<CallState>('preparing');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && request.chat_session_id) {
      loadChatHistory();
    }
  }, [isOpen, request.chat_session_id]);

  const loadChatHistory = async () => {
    if (!request.chat_session_id) return;
    
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', request.chat_session_id)
        .order('created_at');
      
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleStartCall = () => {
    setCallState('calling');
    setTimeout(() => setCallState('in_call'), 2000);
  };

  const handleEndCall = () => {
    setCallState('ending');
  };

  const handleComplete = () => {
    onComplete(outcome, notes);
    setCallState('preparing');
    setNotes('');
    setOutcome('');
    onClose();
  };

  const getPillarLabel = (pillar: string | null) => {
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || 'Não definido';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {callState === 'preparing' && 'Preparar Chamada'}
            {callState === 'calling' && 'A Ligar...'}
            {callState === 'in_call' && 'Em Chamada'}
            {callState === 'ending' && 'Finalizar Chamada'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Side - Chat History */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Histórico do Chat
              </h4>
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{request.user_name}</span>
                  <Badge variant="outline">{request.company_name}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> {request.user_email}</p>
                  <p><strong>Telefone:</strong> {request.user_phone}</p>
                  <p><strong>Pilar:</strong> {getPillarLabel(request.pillar)}</p>
                  <p><strong>Tempo de Espera:</strong> {new Date(request.created_at).toLocaleString('pt-PT')}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sem histórico de chat disponível</p>
                  </div>
                ) : (
                  chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-50 ml-0 mr-8'
                          : 'bg-gray-50 ml-8 mr-0'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {message.role === 'user' ? request.user_name : 'Assistente AI'}
                      </p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Call Interface & Notes */}
          <div className="space-y-4">
            {/* Call Status */}
            <div className="p-6 border rounded-lg text-center">
              {callState === 'preparing' && (
                <>
                  <Phone className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-semibold mb-2">Preparar para Ligar</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reveja o histórico antes de iniciar a chamada
                  </p>
                  <Button onClick={handleStartCall} className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Iniciar Chamada
                  </Button>
                </>
              )}

              {callState === 'calling' && (
                <>
                  <div className="relative mb-4">
                    <Phone className="h-12 w-12 mx-auto text-blue-600 animate-pulse" />
                  </div>
                  <p className="text-lg font-semibold mb-2">A ligar...</p>
                  <p className="text-sm text-muted-foreground">
                    {request.user_phone}
                  </p>
                </>
              )}

              {callState === 'in_call' && (
                <>
                  <Phone className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-semibold mb-2">Em Chamada</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {request.user_name}
                  </p>
                  <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Terminar Chamada
                  </Button>
                </>
              )}

              {callState === 'ending' && (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-semibold mb-2">Registar Resultado</p>
                  <p className="text-sm text-muted-foreground">
                    Selecione o resultado da chamada
                  </p>
                </>
              )}
            </div>

            {/* Notes - Always Visible */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas da Chamada</label>
              <Textarea
                placeholder="Escreva notas sobre a chamada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                disabled={callState === 'preparing' || callState === 'calling'}
              />
            </div>

            {/* Outcome Selection - Only in ending state */}
            {callState === 'ending' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Resultado</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={outcome === 'resolved' ? 'default' : 'outline'}
                    onClick={() => setOutcome('resolved')}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-xs">Resolvido</span>
                  </Button>
                  <Button
                    variant={outcome === 'session_booked' ? 'default' : 'outline'}
                    onClick={() => setOutcome('session_booked')}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-xs">Sessão Marcada</span>
                  </Button>
                  <Button
                    variant={outcome === 'escalated' ? 'default' : 'outline'}
                    onClick={() => setOutcome('escalated')}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <ArrowRight className="h-5 w-5" />
                    <span className="text-xs">Encaminhar</span>
                  </Button>
                  <Button
                    variant={outcome === 'follow_up' ? 'default' : 'outline'}
                    onClick={() => setOutcome('follow_up')}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="text-xs">Follow-up</span>
                  </Button>
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={!outcome || !notes}
                  className="w-full"
                  size="lg"
                >
                  Confirmar e Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
