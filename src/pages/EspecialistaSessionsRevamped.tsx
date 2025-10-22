import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Play, CheckCircle, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockEspecialistaSessions } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { SessionNoteModal } from '@/components/specialist/SessionNoteModal';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const EspecialistaSessionsRevamped = () => {
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const allSessions = filterByCompanyAccess(mockEspecialistaSessions);
  const today = new Date().toISOString().split('T')[0];

  // Categorize sessions
  const todaySessions = allSessions.filter(s => s.date === today && s.status === 'scheduled');
  const upcomingSessions = allSessions.filter(s => s.date > today && s.status === 'scheduled').slice(0, 5);
  const completedSessions = allSessions.filter(s => s.status === 'completed').slice(0, 3);

  const handleStartSession = (session: any) => {
    toast({
      title: 'Sessão Iniciada',
      description: `Sessão com ${session.user_name} iniciada.`,
    });
  };

  const handleEndSession = (session: any) => {
    setSelectedSession(session);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (notes: string, outcome: string) => {
    toast({
      title: 'Nota Guardada',
      description: `Nota interna guardada. Resultado: ${outcome}`,
    });
    setIsNoteModalOpen(false);
  };

  const handleAddNote = (session: any) => {
    setSelectedSession(session);
    setIsNoteModalOpen(true);
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

  const getPillarColor = (pillar: string) => {
    const colors = {
      psychological: 'bg-blue-100 text-blue-700',
      physical: 'bg-green-100 text-green-700',
      financial: 'bg-purple-100 text-purple-700',
      legal: 'bg-orange-100 text-orange-700'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const renderSessionCard = (session: any, showActions = true) => (
    <Card key={session.id} className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{session.user_name}</h4>
            <p className="text-xs text-muted-foreground">{session.company_name}</p>
          </div>
          <Badge className={`text-xs ${getPillarColor(session.pillar)}`}>
            {getPillarLabel(session.pillar)}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{new Date(session.date).toLocaleDateString('pt-PT')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{session.time}</span>
          </div>
        </div>

        {session.notes && (
          <p className="text-xs text-muted-foreground italic">{session.notes}</p>
        )}

        {showActions && session.status === 'scheduled' && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => handleStartSession(session)} className="flex-1">
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEndSession(session)}>
              <CheckCircle className="h-3 w-3 mr-1" />
              Finalizar
            </Button>
          </div>
        )}

        {session.status === 'completed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddNote(session)}
            className="w-full"
          >
            <FileText className="h-3 w-3 mr-1" />
            Ver/Adicionar Nota
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Sessões Agendadas
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir sessões com timeline visual e notas internas
        </p>
      </div>

      <BentoGrid className="lg:grid-rows-2 gap-4">
        {/* Calendar Visual - Top Left */}
        <BentoCard
          name="Calendário Visual"
          description={`${allSessions.length} sessões no total`}
          Icon={CalendarIcon}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />}
          iconColor="text-green-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6">
            <div className="space-y-4">
              <div className="text-center p-6 bg-white/60 rounded-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {todaySessions.length}
                </div>
                <p className="text-sm text-gray-600">Sessões Hoje</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-white/40 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {upcomingSessions.length}
                  </div>
                  <p className="text-xs text-gray-600">Próximas</p>
                </div>
                <div className="text-center p-4 bg-white/40 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 mb-1">
                    {completedSessions.length}
                  </div>
                  <p className="text-xs text-gray-600">Completas</p>
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Today's Sessions - Top Right */}
        <BentoCard
          name="Sessões de Hoje"
          description={`${todaySessions.length} sessões agendadas para hoje`}
          Icon={Clock}
          className="lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
          iconColor="text-blue-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <ScrollArea className="h-[320px] px-6 pb-6">
            <div className="space-y-3">
              {todaySessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem sessões hoje</p>
                </div>
              ) : (
                todaySessions.map(session => renderSessionCard(session, true))
              )}
            </div>
          </ScrollArea>
        </BentoCard>

        {/* Upcoming Sessions - Bottom Left */}
        <BentoCard
          name="Próximas Sessões"
          description={`Próximos 7 dias`}
          Icon={CalendarIcon}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />}
          iconColor="text-yellow-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <ScrollArea className="h-[320px] px-6 pb-6">
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem sessões próximas</p>
                </div>
              ) : (
                upcomingSessions.map(session => renderSessionCard(session, false))
              )}
            </div>
          </ScrollArea>
        </BentoCard>

        {/* Completed Sessions - Bottom Right */}
        <BentoCard
          name="Sessões Completadas"
          description="Histórico recente"
          Icon={CheckCircle}
          className="lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50" />}
          iconColor="text-gray-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <ScrollArea className="h-[320px] px-6 pb-6">
            <div className="space-y-3">
              {completedSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem sessões completadas</p>
                </div>
              ) : (
                completedSessions.map(session => renderSessionCard(session, false))
              )}
            </div>
          </ScrollArea>
        </BentoCard>
      </BentoGrid>

      {/* Session Note Modal */}
      {selectedSession && (
        <SessionNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          session={selectedSession}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
};

export default EspecialistaSessionsRevamped;
