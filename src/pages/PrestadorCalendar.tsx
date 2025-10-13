import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Building,
  Brain,
  Heart,
  DollarSign,
  Scale,
  CheckCircle,
  XCircle,
  Plus,
  Eye
} from 'lucide-react';
import { mockCalendarEvents } from '@/data/prestadorMetrics';
import { useToast } from "@/hooks/use-toast";

const PrestadorCalendar = () => {
  const [events, setEvents] = useState(mockCalendarEvents);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Financeira':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEventClick = (event: any) => {
    if (event.type === 'session') {
      setSelectedEvent(event);
    } else if (event.type === 'available') {
      // Handle availability slot click - could open booking modal
      toast({
        title: "Slot Disponível",
        description: `Horário ${event.time} está disponível para agendamento`
      });
    }
  };

  const handleMarkAsCompleted = () => {
    if (selectedEvent) {
      toast({
        title: "Sessão marcada como concluída",
        description: `Sessão com ${selectedEvent.clientName} foi concluída com sucesso`
      });
      setSelectedEvent(null);
    }
  };

  const handleMarkAsCancelled = () => {
    if (selectedEvent) {
      toast({
        title: "Sessão cancelada",
        description: `Sessão com ${selectedEvent.clientName} foi cancelada`
      });
      setSelectedEvent(null);
    }
  };

  const handleBlockAvailability = () => {
    setShowAvailabilityModal(true);
  };

  const handleAddAvailabilityBlock = () => {
    toast({
      title: "Disponibilidade bloqueada",
      description: "Período de indisponibilidade adicionado ao calendário"
    });
    setShowAvailabilityModal(false);
  };

  // Generate calendar days for current view
  const generateCalendarDays = () => {
    const days = [];
    const startDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      // Show current week
      const dayOfWeek = startDate.getDay();
      const startOfWeek = new Date(startDate);
      startOfWeek.setDate(startDate.getDate() - dayOfWeek + 1); // Start from Monday
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
    } else {
      // Show current month
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Add days from previous month to fill first week
      const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
      for (let i = startDay; i > 0; i--) {
        const day = new Date(firstDay);
        day.setDate(firstDay.getDate() - i);
        days.push(day);
      }
      
      // Add all days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day));
      }
      
      // Add days from next month to fill last week
      const endDay = lastDay.getDay() === 0 ? 0 : 7 - lastDay.getDay();
      for (let day = 1; day <= endDay; day++) {
        days.push(new Date(year, month + 1, day));
      }
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventColor = (event: any) => {
    if (event.type === 'available') return 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200';
    if (event.type === 'session') {
      if (event.status === 'confirmed') return 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200';
      if (event.status === 'cancelled') return 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200';
    }
    if (event.type === 'blocked') return 'bg-gray-100 border-gray-300 text-gray-700';
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const getEventIcon = (event: any) => {
    if (event.type === 'available') return '🟩';
    if (event.type === 'session') {
      if (event.status === 'confirmed') return '🔵';
      if (event.status === 'cancelled') return '🔴';
    }
    if (event.type === 'blocked') return '⚫';
    return '';
  };

  const calendarDays = generateCalendarDays();

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
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Visualização Semanal</SelectItem>
              <SelectItem value="month">Visualização Mensal</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleBlockAvailability} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Bloquear Disponibilidade
          </Button>
        </div>
      </div>

      {/* Calendar Legend */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>🟩 Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>🔵 Sessão Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>🔴 Sessão Cancelada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>⚫ Indisponível</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {viewMode === 'week' ? 'Semana' : 'Mês'} de {currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getTime() - (viewMode === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000))}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoje
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getTime() + (viewMode === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000))}
              >
                Próximo
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center font-medium text-sm p-2 bg-muted/50 rounded">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] border rounded-lg p-2 space-y-1
                    ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : 'bg-background'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {day.getDate()}
                    </span>
                    {isToday && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`
                          text-xs p-2 rounded cursor-pointer border transition-colors
                          ${getEventColor(event)}
                        `}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center gap-1">
                          <span>{getEventIcon(event)}</span>
                          <span className="font-medium">{event.time}</span>
                        </div>
                        {event.type === 'session' && (
                          <div className="truncate">
                            {event.clientName}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Sessão</DialogTitle>
            <DialogDescription>
              Informações sobre esta sessão agendada
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Colaborador</label>
                  <p className="text-lg font-semibold">{selectedEvent.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-lg font-semibold">{selectedEvent.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pilar</label>
                  <div className="mt-1">
                    <Badge className={`${getPillarBadgeColor(selectedEvent.pillar)} flex items-center gap-1 w-fit`}>
                      {getPillarIcon(selectedEvent.pillar)}
                      {selectedEvent.pillar}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {selectedEvent.sessionType === 'Virtual' ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {selectedEvent.sessionType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="text-lg">{new Date(selectedEvent.date).toLocaleDateString('pt-PT')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hora</label>
                  <p className="text-lg">{selectedEvent.time}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleMarkAsCompleted}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar como Concluída
                </Button>
                <Button 
                  onClick={handleMarkAsCancelled}
                  variant="destructive"
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar Sessão
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Availability Modal */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bloquear Disponibilidade</DialogTitle>
            <DialogDescription>
              Marcar períodos de indisponibilidade no calendário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground">
                Em breve poderá bloquear períodos de indisponibilidade diretamente no calendário.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
                Fechar
              </Button>
              <Button onClick={handleAddAvailabilityBlock}>
                Simular Bloqueio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrestadorCalendar;
