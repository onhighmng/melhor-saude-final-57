import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { mockCalendarEvents, type PrestadorCalendarEvent } from '@/data/prestadorMetrics';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isSameDay } from 'date-fns';

const PrestadorCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  // Transform calendar events to FullScreenCalendar format
  const calendarData = useMemo(() => {
    console.log('Mock Calendar Events:', mockCalendarEvents.length);
    console.log('First 3 events:', mockCalendarEvents.slice(0, 3));
    
    const groupedByDate = mockCalendarEvents.reduce((acc, event: PrestadorCalendarEvent) => {
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
    
    console.log('Calendar Data:', result.length, 'days with events');
    console.log('First day with events:', result[0]);
    
    return result;
  }, []);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return mockCalendarEvents.filter(event => 
      isSameDay(new Date(event.date), selectedDate)
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayEventsModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    const calendarEvent = mockCalendarEvents.find(e => e.id === event.id);
    if (calendarEvent) {
      toast({
        title: calendarEvent.clientName || 'Evento',
        description: `${calendarEvent.time} - ${calendarEvent.type}`,
      });
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

      {/* Availability Settings Modal - Placeholder */}
      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Disponibilidade</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-muted-foreground">
            <p>Funcionalidade de disponibilidade em breve</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrestadorCalendar;
