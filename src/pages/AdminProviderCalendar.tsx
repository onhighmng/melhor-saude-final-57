import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingModal } from '@/components/admin/providers/BookingModal';
import { CalendarSlot } from '@/types/adminProvider';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminProviderCalendar = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: pt }));
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  useEffect(() => {
    if (provider) {
      loadSlots();
    }
  }, [provider, currentWeekStart]);

  const loadProvider = async () => {
    if (!providerId) return;
    
    try {
      const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error) throw error;
      setProvider(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar prestador';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!providerId) return;

    const weekEnd = endOfWeek(currentWeekStart, { locale: pt });
    
    try {
      // Load bookings for this provider in the current week
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, profiles(name), companies(name)')
        .eq('prestador_id', providerId)
        .gte('date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .neq('status', 'cancelled');

      if (error) throw error;

      // Generate slots for the week
      const hours = [9, 10, 11, 14, 15, 16, 17];
      const newSlots: CalendarSlot[] = [];

      for (let day = 0; day < 7; day++) {
        const date = addDays(currentWeekStart, day);
        hours.forEach((hour) => {
          const slotDate = new Date(date);
          slotDate.setHours(hour, 0, 0, 0);
          
          const booking = bookings?.find(b => {
            const bookingDate = new Date(b.date);
            const bookingHour = b.start_time ? parseInt(b.start_time.split(':')[0]) : null;
            return isSameDay(bookingDate, date) && bookingHour === hour;
          });

          newSlots.push({
            id: `${day}-${hour}`,
            date: slotDate,
            isAvailable: !booking,
            ...(booking ? {
              bookingId: booking.id,
              collaboratorName: (booking.profiles as any)?.name as string || 'N/A',
              company: (booking.companies as any)?.name as string || 'N/A',
              sessionType: booking.meeting_type as 'virtual' | 'presential',
            } : {}),
          });
        });
      }

      setSlots(newSlots);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar horários';
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate('/admin/users-management');
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleSlotClick = (slot: CalendarSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setBookingModalOpen(true);
    }
  };

  

  if (!provider) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Prestador não encontrado</p>
        </div>
      </div>
    );
  }

  const weekEnd = endOfWeek(currentWeekStart, { locale: pt });
  const hours = [9, 10, 11, 14, 15, 16, 17];
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Calendário de {String(provider.name)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {String(provider.specialty)} • {String(provider.pillar)}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[200px] text-center">
              {format(currentWeekStart, "d MMM", { locale: pt })} - {format(weekEnd, "d MMM yyyy", { locale: pt })}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="presential">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-sm text-muted-foreground">Ocupado</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Days header */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs font-medium text-muted-foreground"></div>
              {weekDays.map((day, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(day, 'EEE', { locale: pt })}
                  </div>
                  <div className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
                <div className="text-xs font-medium text-muted-foreground py-2">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slot = slots.find(s => 
                    s.date.getHours() === hour && 
                    isSameDay(s.date, day)
                  );
                  
                  if (!slot) return <div key={dayIndex} className="min-h-[60px]" />;
                  
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!slot.isAvailable}
                      className={`min-h-[60px] p-2 rounded-lg border-2 text-left transition-all ${
                        slot.isAvailable
                          ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer'
                          : 'bg-blue-50 border-blue-200 cursor-default'
                      }`}
                    >
                      {!slot.isAvailable && slot.collaboratorName && (
                        <div className="text-xs">
                          <div className="font-medium truncate">{slot.collaboratorName}</div>
                          <div className="text-muted-foreground truncate">{slot.company}</div>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {slot.sessionType}
                          </Badge>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Selecione um horário disponível para agendar
        </p>
      </Card>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          provider={provider}
          slot={selectedSlot}

        />
      )}
    </div>
  );
};

export default AdminProviderCalendar;
