import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EscalatedChat } from '@/types/specialist';
import { Phone, Calendar, MessageSquare, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChatTranscript } from './ChatTranscript';
import { CallLogForm } from './CallLogForm';
import { useSpecialistCallLogs } from '@/hooks/useSpecialistCallLogs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EscalatedChatCardProps {
  chat: EscalatedChat;
}

export const EscalatedChatCard: React.FC<EscalatedChatCardProps> = ({ chat }) => {
  const { user } = useAuth();
  const { createCallLog } = useSpecialistCallLogs(user?.id);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);

  const pillarLabels = {
    legal: 'Jurídico',
    psychological: 'Psicológico',
    physical: 'Físico',
    financial: 'Financeiro',
  };

  const handleCallLogSubmit = async (data: any) => {
    await createCallLog(data);
    setShowCallForm(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                {chat.user_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{chat.user_email}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={chat.phone_contact_made ? 'default' : 'secondary'}>
                {chat.pillar ? pillarLabels[chat.pillar] : 'Geral'}
              </Badge>
              {chat.phone_contact_made && (
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  Contacto Feito
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(chat.created_at), "PPp", { locale: pt })}
            </span>
          </div>

          {chat.phone_escalation_reason && (
            <div className="rounded-lg bg-warning/10 p-3 border border-warning/20">
              <p className="text-sm font-medium text-warning-foreground mb-1">
                Motivo da Escalação:
              </p>
              <p className="text-sm text-muted-foreground">{chat.phone_escalation_reason}</p>
            </div>
          )}

          {chat.call_log && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium mb-2">Registo de Chamada</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Duração: {chat.call_log.call_duration || 'N/A'} minutos</p>
                <p>Resultado: {chat.call_log.outcome || 'Pendente'}</p>
                {chat.call_log.call_notes && (
                  <p className="mt-2 italic">"{chat.call_log.call_notes}"</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscript(true)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Ver Conversa
            </Button>
            {!chat.call_log && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCallForm(true)}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Registar Chamada
              </Button>
            )}
            {chat.call_log?.outcome === 'session_booked' && (
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Sessão
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Conversa com {chat.user_name}</DialogTitle>
          </DialogHeader>
          <ChatTranscript messages={chat.messages} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCallForm} onOpenChange={setShowCallForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registar Chamada com {chat.user_name}</DialogTitle>
          </DialogHeader>
          <CallLogForm
            sessionId={chat.id}
            userId={chat.user_id}
            onSubmit={handleCallLogSubmit}
            onCancel={() => setShowCallForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
