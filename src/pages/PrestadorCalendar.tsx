import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isSameDay } from 'date-fns';
import { AvailabilitySettings } from '@/components/specialist/AvailabilitySettings';

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  type: 'available' | 'session' | 'blocked';
  clientName?: string;
  company?: string;
  pillar?: string;
  status?: string;
}

const PrestadorCalendar = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load calendar events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      if (!profile?.id) return;

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) return;

        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles (name),
            companies (company_name)
          `)
          .eq('prestador_id', prestador.id);

        if (bookings) {
          const events: CalendarEvent[] = bookings.map((b: any) => ({
            id: b.id,
            date: b.date,
            time: b.start_time || '00:00',
            type: 'session' as const,
            clientName: (b.profiles as any)?.name,
            company: (b.companies as any)?.company_name,
            pillar: b.pillar,
            status: b.status
          }));
          setCalendarEvents(events);
        }
      } catch (error) {
        console.error('Error loading calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [profile?.id]);

  // Transform calendar events to FullScreenCalendar format
  const calendarData = useMemo(() => {
    const groupedByDate = calendarEvents.reduce((acc, event) => {
      const dateKey = event.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      const [hours, minutes] = event.time.split(':').map(Number);
      
      let name = '';
      switch (event.type) {
        case 'available':
          name = 'Disponível';
          break;
        case 'session':
          name = event.clientName || 'Sessão';
          break;
        case 'blocked':
          name = 'Indisponível';
          break;
      }
      
      acc[dateKey].push({
        id: event.id,
        name: event.clientName ? `${event.clientName} - ${event.company}` : name,
        time: event.time,
        datetime: `${event.date}T${event.time}`,
        userName: event.clientName,
        pillar: event.pillar,
      });
      return acc;
    }, {} as Record<string, any[]>);

    const result = Object.entries(groupedByDate).map(([date, events]) => ({
      day: new Date(date),
      events,
    }));
    
    return result;
  }, [calendarEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return calendarEvents.filter(event => 
      isSameDay(new Date(event.date), selectedDate)
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, calendarEvents]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayEventsModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    const calendarEvent = calendarEvents.find(e => e.id === event.id);
    if (calendarEvent) {
      toast({
        title: calendarEvent.clientName || 'Evento',
        description: `${calendarEvent.time} - ${calendarEvent.type}`,
      });
    }
  };

  const handleAddSession = () => {
    setIsAddSessionModalOpen(true);
  };

  const handleConfirmAddSession = () => {
    toast({
      title: 'Sessão Adicionada',
      description: 'Nova sessão adicionada ao calendário com sucesso.',
    });
    setIsAddSessionModalOpen(false);
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
      physical: 'bg-yellow-100 text-yellow-700',
      financial: 'bg-green-100 text-green-700',
      legal: 'bg-purple-100 text-purple-700'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      available: 'Disponível',
      session: 'Sessão',
      blocked: 'Bloqueio'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      available: 'bg-green-100 text-green-700',
      session: 'bg-blue-100 text-blue-700',
      blocked: 'bg-gray-100 text-gray-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
      <div>
        <h1 className="text-4xl font-heading font-bold">
          Calendário
        </h1>
        <p className="text-muted-foreground mt-1 text-base font-semibold">
          Gerir sessões e disponibilidade
        </p>
      </div>

      <Card className="p-0">
        <FullScreenCalendar 
          data={calendarData}
          onEventClick={handleEventClick}
          onDayClick={handleDateClick}
          onSetAvailability={() => setIsAvailabilityModalOpen(true)}
          onAddEvent={handleAddSession}
        />
      </Card>

      {/* Day Events Modal */}
      <Dialog open={isDayEventsModalOpen} onOpenChange={setIsDayEventsModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Eventos do dia {selectedDate && selectedDate.toLocaleDateString('pt-PT')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-3 pr-4">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem eventos neste dia</p>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">
                            {event.clientName || getTypeLabel(event.type)}
                          </h4>
                          {event.company && (
                            <p className="text-xs text-muted-foreground">{event.company}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={`text-xs ${getTypeColor(event.type)}`}>
                            {getTypeLabel(event.type)}
                          </Badge>
                          {event.pillar && (
                            <Badge className={`text-xs ${getPillarColor(event.pillar)}`}>
                              {getPillarLabel(event.pillar)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        {event.status && (
                          <Badge variant="outline" className="text-xs">
                            {event.status === 'confirmed' ? 'Confirmada' : event.status === 'cancelled' ? 'Cancelada' : event.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Availability Settings Modal */}
      <AvailabilitySettings 
        open={isAvailabilityModalOpen}
        onOpenChange={setIsAvailabilityModalOpen}
      />

      {/* Add Session Modal - Placeholder */}
      <Dialog open={isAddSessionModalOpen} onOpenChange={setIsAddSessionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Sessão</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Funcionalidade para adicionar nova sessão em breve.
            </p>
            <Button onClick={handleConfirmAddSession} className="w-full">
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrestadorCalendar;
