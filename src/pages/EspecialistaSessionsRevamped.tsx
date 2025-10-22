import React, { useState, useMemo } from 'react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone,
  User,
  Building2,
  CheckCircle,
  PlayCircle,
  StopCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { SessionNoteModal } from '@/components/specialist/SessionNoteModal';
import { mockEspecialistaSessions } from '@/data/especialistaGeralMockData';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const EspecialistaSessionsRevamped = () => {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const pillarLabels: Record<string, string> = {
    psychological: 'Psicológico',
    financial: 'Financeiro',
    legal: 'Jurídico',
    physical: 'Físico',
  };

  // Categorizar sessões
  const todaySessions = useMemo(
    () => mockEspecialistaSessions.filter(s => isToday(parseISO(s.date)) && s.status === 'scheduled').sort((a, b) => a.time.localeCompare(b.time)),
    []
  );

  const upcomingSessions = useMemo(
    () => mockEspecialistaSessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return !isToday(sessionDate) && sessionDate >= new Date() && s.status === 'scheduled';
    }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    []
  );

  const completedSessions = useMemo(
    () => mockEspecialistaSessions.filter(s => s.status === 'completed').slice(0, 5),
    []
  );

  const handleStartSession = (sessionId: string) => {
    toast({
      title: 'Sessão Iniciada',
      description: 'A sala virtual foi aberta.',
    });
  };

  const handleEndSession = (sessionId: string, sessionData: any) => {
    setSelectedSession(sessionData);
    setNoteModalOpen(true);
  };

  const handleSaveNotes = (sessionId: string, notes: string) => {
    console.log('Guardar notas:', sessionId, notes);
    // Aqui faria o update no backend
  };

  const handleViewChatHistory = (sessionId: string) => {
    toast({
      title: 'Chat Prévio',
      description: 'A abrir histórico de chat...',
    });
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "dd 'de' MMMM", { locale: pt });
  };

  const renderSessionCard = (session: any, showActions: boolean = true) => (
    <Card key={session.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">{session.user_name}</p>
              <p className="text-xs text-muted-foreground">{session.user_email}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {pillarLabels[session.pillar] || session.pillar}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {session.company_name}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{getDateLabel(session.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{session.time}</span>
          </div>
        </div>

        {session.notes && (
          <p className="text-xs text-muted-foreground border-l-2 border-purple-200 pl-2 italic">
            {session.notes}
          </p>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStartSession(session.id)}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEndSession(session.id, session)}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Terminar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewChatHistory(session.id)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold">Sessões Agendadas</h1>
        <p className="text-muted-foreground">
          Gerir as suas sessões individuais com colaboradores
        </p>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 min-h-0">
        <BentoGrid className="h-full" style={{ gridAutoRows: '1fr' }}>
          {/* Sessões de Hoje */}
          <BentoCard
            name="📅 Sessões de Hoje"
            description={`${todaySessions.length} sessões agendadas para hoje`}
            Icon={Calendar}
            className="col-span-3 lg:col-span-1 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
            }
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-blue-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {todaySessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Sem sessões agendadas para hoje
                      </p>
                    </div>
                  ) : (
                    todaySessions.map(session => renderSessionCard(session, true))
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>

          {/* Próximas Sessões */}
          <BentoCard
            name="🔜 Próximas Sessões"
            description={`${upcomingSessions.length} sessões nos próximos dias`}
            Icon={Clock}
            className="col-span-3 lg:col-span-1 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50" />
            }
            iconColor="text-purple-600"
            textColor="text-gray-900"
            descriptionColor="text-purple-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Sem sessões futuras agendadas
                      </p>
                    </div>
                  ) : (
                    upcomingSessions.map(session => renderSessionCard(session, true))
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>

          {/* Sessões Completadas */}
          <BentoCard
            name="✅ Sessões Completadas"
            description="Últimas 5 sessões realizadas"
            Icon={CheckCircle}
            className="col-span-3 lg:col-span-1 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
            }
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-green-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {completedSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma sessão completada ainda
                      </p>
                    </div>
                  ) : (
                    completedSessions.map(session => renderSessionCard(session, false))
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>

      {/* Session Note Modal */}
      <SessionNoteModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
        session={selectedSession}
        onSave={handleSaveNotes}
      />
    </div>
  );
};

export default EspecialistaSessionsRevamped;
