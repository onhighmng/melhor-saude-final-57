import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Phone, Clock, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockEspecialistaSessions } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { SessionNoteModal } from '@/components/specialist/SessionNoteModal';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { isSameDay } from 'date-fns';

const EspecialistaSessionsRevamped = () => {
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDaySessionsModalOpen, setIsDaySessionsModalOpen] = useState(false);
  
  const allSessions = filterByCompanyAccess(mockEspecialistaSessions);
  
  // Debug: Show all if filter returns empty (for demo purposes)
  const sessionsToShow = allSessions.length > 0 ? allSessions : mockEspecialistaSessions;

  // Transform sessions data for calendar
  const calendarData = useMemo(() => {
    const groupedByDate = sessionsToShow.reduce((acc, session) => {
      const dateKey = session.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        id: session.id,
        name: `${session.user_name} - ${getPillarLabel(session.pillar)}`,
        time: session.time,
        datetime: `${session.date}T${session.time}`,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groupedByDate).map(([date, events]) => ({
      day: new Date(date),
      events,
    }));
  }, [sessionsToShow]);

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsToShow.filter(session => 
      isSameDay(new Date(session.date), selectedDate)
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [sessionsToShow, selectedDate]);

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDaySessionsModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    const session = sessionsToShow.find(s => s.id === event.id);
    if (session) {
      setSelectedSession(session);
      setIsNoteModalOpen(true);
    }
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

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      scheduled: 'Agendada',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return {
      variant: variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700',
      label: labels[status as keyof typeof labels] || status
    };
  };

  const getSessionTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />;
  };

  const getSessionTypeLabel = (type: string) => {
    return type === 'video' ? 'Vídeo' : 'Chamada';
  };

  const renderSessionCard = (session: any) => (
    <Card key={session.id} className="p-4 hover:shadow-md transition-shadow">
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

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{session.time}</span>
            </div>
            <div className="flex items-center gap-1">
              {getSessionTypeIcon(session.session_type || 'video')}
              <span>{getSessionTypeLabel(session.session_type || 'video')}</span>
            </div>
          </div>
          <Badge className={`text-xs ${getStatusBadge(session.status).variant}`}>
            {getStatusBadge(session.status).label}
          </Badge>
        </div>

        {session.notes && (
          <p className="text-xs text-muted-foreground italic">{session.notes}</p>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddNote(session)}
          className="w-full"
        >
          <FileText className="h-3 w-3 mr-1" />
          Ver/Adicionar Notas
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Calendário Pessoal
        </h1>
        <p className="text-muted-foreground mt-1">
          Sessões futuras e passadas com tipo e estado
        </p>
      </div>

      <Card className="p-0">
        <FullScreenCalendar 
          data={calendarData}
          onEventClick={handleEventClick}
          onDayClick={handleDateClick}
        />
      </Card>

      {/* Day Sessions Modal */}
      <Dialog open={isDaySessionsModalOpen} onOpenChange={setIsDaySessionsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Sessões do dia {selectedDate && selectedDate.toLocaleDateString('pt-PT')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {selectedDateSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem sessões neste dia</p>
                </div>
              ) : (
                selectedDateSessions.map(renderSessionCard)
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
