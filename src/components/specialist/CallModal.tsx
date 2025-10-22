import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone, User, Building2, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface CallRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  company_name: string;
  pillar: string | null;
  wait_time: number;
  notes?: string;
  created_at: string;
  chat_history?: Array<{ role: string; content: string; created_at: string }>;
}

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callRequest: CallRequest | null;
  onCallComplete: (result: any) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  open,
  onOpenChange,
  callRequest,
  onCallComplete,
}) => {
  const [callStatus, setCallStatus] = useState<'preparing' | 'ongoing' | 'completed'>('preparing');
  const [callDuration, setCallDuration] = useState('');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  const pillarLabels: Record<string, string> = {
    psychological: 'Psicológico',
    financial: 'Financeiro',
    legal: 'Jurídico',
    physical: 'Físico',
  };

  const handleStartCall = () => {
    setCallStatus('ongoing');
    setStartTime(new Date());
    toast({
      title: 'Chamada Iniciada',
      description: `A ligar para ${callRequest?.user_name}...`,
    });
  };

  const handleEndCall = () => {
    if (!outcome) {
      toast({
        title: 'Resultado Obrigatório',
        description: 'Por favor, selecione o resultado da chamada.',
        variant: 'destructive',
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: 'Notas Obrigatórias',
        description: 'Por favor, adicione notas sobre a chamada.',
        variant: 'destructive',
      });
      return;
    }

    const duration = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 60000) : parseInt(callDuration);

    onCallComplete({
      callRequestId: callRequest?.id,
      duration,
      outcome,
      notes,
      completed_at: new Date().toISOString(),
    });

    toast({
      title: 'Chamada Registada',
      description: 'O registo da chamada foi guardado com sucesso.',
    });

    // Reset form
    setCallStatus('preparing');
    setCallDuration('');
    setOutcome('');
    setNotes('');
    setStartTime(null);
    onOpenChange(false);
  };

  if (!callRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {callStatus === 'preparing' && 'Preparar Chamada'}
            {callStatus === 'ongoing' && 'Chamada em Curso'}
            {callStatus === 'completed' && 'Concluir Chamada'}
          </DialogTitle>
          <DialogDescription>
            {callStatus === 'preparing' && 'Reveja o histórico do utilizador antes de iniciar a chamada'}
            {callStatus === 'ongoing' && 'Tome notas durante a chamada e registe o resultado'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - User Info & Chat History */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{callRequest.user_name}</p>
                    <p className="text-muted-foreground text-xs">{callRequest.user_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-mono">{callRequest.user_phone}</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p>{callRequest.company_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {callRequest.pillar ? pillarLabels[callRequest.pillar] || 'Geral' : 'Geral'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Aguarda há {callRequest.wait_time} min
                  </div>
                </div>

                {callRequest.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Notas iniciais:</p>
                    <p className="text-sm">{callRequest.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat History */}
            {callRequest.chat_history && callRequest.chat_history.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-sm">Histórico de Chat</p>
                  </div>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                      {callRequest.chat_history.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-blue-50 border border-blue-100'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <p className="font-medium text-xs text-muted-foreground mb-1">
                            {msg.role === 'user' ? 'Utilizador' : 'Assistente'} •{' '}
                            {format(new Date(msg.created_at), 'HH:mm', { locale: pt })}
                          </p>
                          <p>{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Call Actions */}
          <div className="space-y-4">
            {callStatus === 'preparing' && (
              <Card className="border-2 border-primary">
                <CardContent className="pt-6 space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pronto para ligar?</h3>
                    <p className="text-sm text-muted-foreground">
                      Reveja o histórico acima antes de iniciar a chamada
                    </p>
                  </div>
                  <Button onClick={handleStartCall} className="w-full" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Iniciar Chamada
                  </Button>
                </CardContent>
              </Card>
            )}

            {callStatus === 'ongoing' && (
              <Card className="border-2 border-green-500">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-600">Chamada em Curso</p>
                    {startTime && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Iniciada às {format(startTime, 'HH:mm', { locale: pt })}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="outcome">Resultado da Chamada *</Label>
                      <Select value={outcome} onValueChange={setOutcome}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o resultado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resolved_by_phone">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Resolvido por Telefone
                            </div>
                          </SelectItem>
                          <SelectItem value="session_booked">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                              Sessão Agendada
                            </div>
                          </SelectItem>
                          <SelectItem value="escalated_to_specialist">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-orange-600" />
                              Encaminhado para Prestador
                            </div>
                          </SelectItem>
                          <SelectItem value="follow_up_needed">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-yellow-600" />
                              Requer Follow-up
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas da Chamada *</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Descreva o que foi discutido, ações tomadas e próximos passos..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    {!startTime && (
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={callDuration}
                          onChange={(e) => setCallDuration(e.target.value)}
                          placeholder="Ex: 15"
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={handleEndCall} className="w-full" variant="default" size="lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Terminar e Guardar
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
