import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { usePrestadorCalendar } from '@/hooks/usePrestadorCalendar';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Clock, User, Building, Brain, Dumbbell, DollarSign, Scale, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isSameDay } from 'date-fns';
import { AvailabilitySettings } from '@/components/specialist/AvailabilitySettings';
import { ReferralBookingModal } from '@/components/specialist/ReferralBookingModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const getPillarColors = (pillar: string) => {
  const colors = {
    'psychological': {
      bgSolid: 'bg-blue-500',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    'physical': {
      bgSolid: 'bg-yellow-500',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    'financial': {
      bgSolid: 'bg-green-500',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    'legal': {
      bgSolid: 'bg-purple-500',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    'saude_mental': {
      bgSolid: 'bg-blue-500',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    'bem_estar_fisico': {
      bgSolid: 'bg-yellow-500',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    'assistencia_financeira': {
      bgSolid: 'bg-green-500',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    'assistencia_juridica': {
      bgSolid: 'bg-purple-500',
      text: 'text-purple-700',
      border: 'border-purple-200'
    }
  }
  return colors[pillar as keyof typeof colors] || colors['psychological']
}

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'psychological':
    case 'saude_mental':
      return Brain
    case 'physical':
    case 'bem_estar_fisico':
      return Dumbbell
    case 'financial':
    case 'assistencia_financeira':
      return DollarSign
    case 'legal':
    case 'assistencia_juridica':
      return Scale
    default:
      return Brain
  }
}

const getPillarName = (pillar: string) => {
  const names = {
    'psychological': 'Saúde Mental',
    'physical': 'Bem-Estar Físico',
    'financial': 'Assistência Financeira',
    'legal': 'Assistência Jurídica',
    'saude_mental': 'Saúde Mental',
    'bem_estar_fisico': 'Bem-Estar Físico',
    'assistencia_financeira': 'Assistência Financeira',
    'assistencia_juridica': 'Assistência Jurídica'
  }
  return names[pillar as keyof typeof names] || pillar
}

// Session Event Card Component
const SessionEventCard = ({ event, toast, onReschedule, onCancel, onConclude }: { event: any; toast: any; onReschedule?: (id: string) => void; onCancel?: (id: string) => void; onConclude?: (id: string) => void; }) => {
  const [meetingLink, setMeetingLink] = useState(event.meetingLink || '');
  const [isEditingLink, setIsEditingLink] = useState(false);

  const colors = getPillarColors(event.pillar);
  const PillarIcon = getPillarIcon(event.pillar);

  const handleSaveLink = async () => {
    // Normalize URL to ensure it has https:// protocol
    const normalizedLink = meetingLink.trim() ? (
      meetingLink.trim().match(/^https?:\/\//i) ? meetingLink.trim() : `https://${meetingLink.trim()}`
    ) : null;

    const { error } = await supabase
      .from('bookings')
      .update({ meeting_link: normalizedLink })
      .eq('id', event.id);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível guardar o link',
        variant: 'destructive'
      });
    } else {
      setIsEditingLink(false);
      toast({
        title: 'Link guardado',
        description: 'O link da reunião foi atualizado'
      });
    }
  };

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 p-6 shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] transition-all duration-500 hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2),-20px_-20px_40px_rgba(255,255,255,1)]'
    )}>
      {/* Pillar Icon */}
      <div className="mb-4 flex justify-center relative z-10">
        <div className="relative">
          <div className={cn(
            "h-20 w-20 overflow-hidden rounded-full p-1 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] flex items-center justify-center",
            colors.bgSolid
          )}>
            <PillarIcon className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="text-center relative z-10">
        <h3 className={cn("text-lg font-semibold", colors.text)}>
          {getPillarName(event.pillar)}
        </h3>
        
        {/* Session Details */}
        <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-sm text-gray-800 dark:text-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{event.time}</span>
          </div>
          
          {event.clientName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{event.clientName}</span>
            </div>
          )}
          
          {event.company && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="font-medium text-xs">{event.company}</span>
            </div>
          )}
        </div>

        {/* Meeting Link Section */}
        {isEditingLink ? (
          <div className="mt-4 space-y-2">
            <Input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveLink} className="flex-1">
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingLink(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        ) : meetingLink ? (
          <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-300 truncate">{meetingLink}</p>
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setIsEditingLink(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              + Adicionar link da reunião
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-2 relative z-10">
        <div className="flex gap-2">
          <button 
            onClick={() => {
              onReschedule?.(event.id);
            }}
            className="flex-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105"
          >
            Reagendar
          </button>
          
          <button 
            onClick={() => {
              if (meetingLink) {
                window.open(meetingLink, '_blank');
              } else {
                setIsEditingLink(true);
              }
            }}
            disabled={!meetingLink}
            className="flex-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Entrar
          </button>
          
          <button 
            onClick={() => {
              onCancel?.(event.id);
            }}
            className="flex-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105"
          >
            Cancelar
          </button>
        </div>
        
        {/* Conclude Button - Full Width Below */}
        <button 
          onClick={() => {
            onConclude?.(event.id);
          }}
          className="w-full rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105"
        >
          Concluir Sessão
        </button>
      </div>

      {/* Animated border on hover */}
      <div className={cn("absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", colors.border)}></div>
    </div>
  );
};

const PrestadorCalendar = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { calendarEvents, loading, refetch } = usePrestadorCalendar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState('');
  
  // Check if user is a specialist (should see forward session button)
  const isSpecialist = profile?.role === 'especialista_geral';

  // Transform calendar events to FullScreenCalendar format
  const calendarData = useMemo(() => {
    if (!calendarEvents || calendarEvents.length === 0) return [];
    
    const groupedByDate = calendarEvents.reduce((acc, event) => {
      const dateKey = event.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
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
        status: event.status,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groupedByDate).map(([date, events]) => ({
      day: new Date(date),
      events,
    }));
  }, [calendarEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate || !calendarEvents) return [];
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

  const handleCancelSession = async (sessionId: string) => {
    console.log('🔴 [CANCEL] Button clicked! Session ID:', sessionId);
    
    try {
      console.log('🔴 [CANCEL] Calling Supabase RPC function...');
      const { data, error } = await supabase.rpc('cancel_booking_as_specialist' as any, {
        _booking_id: sessionId,
        _cancellation_reason: 'Cancelado pelo especialista'
      }) as { data: any; error: any };

      console.log('🔴 [CANCEL] Response:', { data, error });

      if (error) {
        console.error('🔴 [CANCEL] Supabase error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('🔴 [CANCEL] Success!');
        toast({
          title: 'Sessão Cancelada',
          description: 'A sessão foi cancelada com sucesso.',
        });
        // Reload calendar
        await refetch();
      } else {
        console.error('🔴 [CANCEL] Function returned error:', data?.error);
        throw new Error(data?.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('🔴 [CANCEL] Caught error:', error);
      toast({
        title: 'Erro ao Cancelar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleConcludeSession = async (sessionId: string) => {
    console.log('🟣 [CONCLUDE] Button clicked! Session ID:', sessionId);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('🟣 [CONCLUDE] Supabase error:', error);
        throw error;
      }

      console.log('🟣 [CONCLUDE] Success!');
      toast({
        title: 'Sessão Concluída',
        description: 'A sessão foi marcada como concluída com sucesso.',
      });
      
      // Reload calendar
      await refetch();
      
      // Close the modal after successful conclusion
      setIsDayEventsModalOpen(false);
    } catch (error) {
      console.error('🟣 [CONCLUDE] Caught error:', error);
      toast({
        title: 'Erro ao Concluir',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleRescheduleSession = async (sessionId: string, newDate: Date, newTime: string) => {
    console.log('🟢 [RESCHEDULE] Button clicked! Session ID:', sessionId);
    
    try {
      console.log('🟢 [RESCHEDULE] Calling Supabase RPC function...');
      const { data, error } = await supabase.rpc('reschedule_booking_as_specialist' as any, {
        _booking_id: sessionId,
        _new_booking_date: newDate.toISOString().split('T')[0],
        _new_start_time: newTime
      }) as { data: any; error: any };

      console.log('🟢 [RESCHEDULE] Response:', { data, error });

      if (error) {
        console.error('🟢 [RESCHEDULE] Supabase error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('🟢 [RESCHEDULE] Success!');
        toast({
          title: 'Sessão Reagendada',
          description: 'A sessão foi reagendada com sucesso.',
        });
        // Reload calendar
        await refetch();
      } else {
        console.error('🟢 [RESCHEDULE] Function returned error:', data?.error);
        throw new Error(data?.error || 'Failed to reschedule booking');
      }
    } catch (error) {
      console.error('🟢 [RESCHEDULE] Caught error:', error);
      toast({
        title: 'Erro ao Reagendar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMeetingLink = async (sessionId: string, meetingLink: string) => {
    console.log('🔵 [LINK] Updating link for session:', sessionId);
    
    try {
      const { data, error } = await supabase.rpc('update_meeting_link_as_specialist' as any, {
        _booking_id: sessionId,
        _meeting_link: meetingLink
      }) as { data: any; error: any };

      console.log('🔵 [LINK] Response:', { data, error });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Link Atualizado',
          description: 'O link da reunião foi atualizado com sucesso.',
        });
        // Reload calendar
        await refetch();
      } else {
        throw new Error(data?.error || 'Failed to update link');
      }
    } catch (error) {
      console.error('🔵 [LINK] Error:', error);
      toast({
        title: 'Erro ao Atualizar Link',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
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

  // Show loading state briefly
  if (loading) {
    return (
      <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
        <div>
          <h1 className="text-4xl font-heading font-bold">Calendário</h1>
          <p className="text-muted-foreground mt-1 text-base font-semibold">
            Gerir sessões e disponibilidade
          </p>
        </div>
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">A carregar calendário...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
          customButton={
            isSpecialist ? (
              <Button 
                onClick={() => setIsReferralModalOpen(true)} 
                variant="outline" 
                className="w-full gap-2 md:w-auto h-8 text-sm"
              >
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                <span>Encaminhar sessão</span>
              </Button>
            ) : undefined
          }
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
                selectedDateEvents.map((event) => {
                  // Only show full session cards for session type events
                  if (event.type !== 'session') {
                    return (
                      <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">
                                {getTypeLabel(event.type)}
                              </h4>
                            </div>
                            <Badge className={`text-xs ${getTypeColor(event.type)}`}>
                              {getTypeLabel(event.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  }

                  // Session events get the beautiful card design
                  return <SessionEventCard 
                    key={event.id} 
                    event={event} 
                    toast={toast}
                    onReschedule={(id) => {
                      setRescheduleSessionId(id);
                      setShowRescheduleDialog(true);
                    }}
                    onCancel={handleCancelSession}
                    onConclude={handleConcludeSession}
                  />;
                })
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

      {/* Referral Booking Modal - Only for Specialists */}
      {isSpecialist && (
        <ReferralBookingModal
          open={isReferralModalOpen}
          onOpenChange={setIsReferralModalOpen}
          onSuccess={() => {
            refetch();
            toast({
              title: 'Sessão Encaminhada',
              description: 'A sessão foi agendada com sucesso'
            });
          }}
        />
      )}

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

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reagendar Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Data</label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate ? rescheduleDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setRescheduleDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Hora</label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowRescheduleDialog(false);
                setRescheduleSessionId(null);
                setRescheduleDate(null);
                setRescheduleTime('');
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (rescheduleSessionId && rescheduleDate && rescheduleTime) {
                    handleRescheduleSession(rescheduleSessionId, rescheduleDate, rescheduleTime);
                    setShowRescheduleDialog(false);
                    setRescheduleSessionId(null);
                    setRescheduleDate(null);
                    setRescheduleTime('');
                  }
                }}
                disabled={!rescheduleDate || !rescheduleTime}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrestadorCalendar;