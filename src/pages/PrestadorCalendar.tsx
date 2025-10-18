import React, { useState, useMemo } from 'react';
import { EventManager, type Event } from "@/components/ui/event-manager";
import { mockCalendarEvents, type PrestadorCalendarEvent } from '@/data/prestadorMetrics';
import { useToast } from "@/hooks/use-toast";

const PrestadorCalendar = () => {
  const { toast } = useToast();

  // Transform existing calendar events to Event format
  const transformedEvents: Event[] = useMemo(() => {
    return mockCalendarEvents.map((event: PrestadorCalendarEvent) => {
      const [year, month, day] = event.date.split('-').map(Number);
      const [hours, minutes] = event.time.split(':').map(Number);
      
      const startTime = new Date(year, month - 1, day, hours, minutes);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      let title = '';
      let color = '';
      
      switch (event.type) {
        case 'available':
          title = 'Disponível';
          color = 'green';
          break;
        case 'session':
          if (event.status === 'confirmed') {
            title = event.clientName || 'Sessão';
            color = 'blue';
          } else if (event.status === 'cancelled') {
            title = event.clientName || 'Sessão Cancelada';
            color = 'red';
          }
          break;
        case 'blocked':
          title = 'Indisponível';
          color = 'gray';
          break;
      }
      
      return {
        id: event.id,
        title,
        description: event.clientName ? `${event.clientName} - ${event.company}` : '',
        startTime,
        endTime,
        color,
        category: event.type === 'session' ? 'Sessão' : event.type === 'available' ? 'Disponível' : 'Bloqueio',
        tags: event.pillar ? [event.pillar] : undefined,
      };
    });
  }, []);

  // Event handlers for the EventManager
  const handleEventCreate = (event: Omit<Event, "id">) => {
    toast({
      title: "Evento criado",
      description: `${event.title} foi adicionado ao calendário`
    });
  };

  const handleEventUpdate = (id: string, updatedEvent: Partial<Event>) => {
    toast({
      title: "Evento atualizado",
      description: "As alterações foram guardadas"
    });
  };

  const handleEventDelete = (id: string) => {
    toast({
      title: "Evento eliminado",
      description: "O evento foi removido do calendário"
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground mt-1">
            Gerir sessões e disponibilidade
          </p>
        </div>
      </div>

      {/* EventManager */}
      <EventManager
        events={transformedEvents}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        categories={["Sessão", "Bloqueio", "Disponível"]}
        colors={[
          { name: "Verde", value: "green", bg: "bg-green-500", text: "text-green-700" },
          { name: "Azul", value: "blue", bg: "bg-blue-500", text: "text-blue-700" },
          { name: "Vermelho", value: "red", bg: "bg-red-500", text: "text-red-700" },
          { name: "Cinza", value: "gray", bg: "bg-gray-500", text: "text-gray-700" },
        ]}
        defaultView="week"
        availableTags={["Saúde Mental", "Bem-Estar Físico", "Assistência Financeira", "Assistência Jurídica"]}
      />
    </div>
  );
};

export default PrestadorCalendar;
