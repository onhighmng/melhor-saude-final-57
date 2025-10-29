import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  currentDate: Date;
  providerId: string;
  onRescheduleComplete: () => void;
}

export const RescheduleDialog = ({
  open,
  onOpenChange,
  bookingId,
  currentDate,
  providerId,
  onRescheduleComplete
}: RescheduleDialogProps) => {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<{ date: Date; time: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (open && providerId) {
      loadAvailableSlots();
    }
  }, [open, providerId]);

  const loadAvailableSlots = async () => {
    setIsFetching(true);
    try {
      // Fetch provider's recurring availability
      const { data: availability, error } = await supabase
        .from('prestador_availability')
        .select('*')
        .eq('prestador_id', providerId)
        .eq('is_recurring', true);

      if (error) throw error;

      // Fetch existing bookings to exclude
      const { data: bookings } = await supabase
        .from('bookings')
        .select('date, start_time')
        .eq('prestador_id', providerId)
        .in('status', ['confirmed', 'scheduled'])
        .gte('date', new Date().toISOString().split('T')[0]);

      const bookedSlots = new Set(
        (bookings || []).map(b => `${b.date}T${b.start_time}`)
      );

      // Generate slots for next 30 days based on day_of_week
      const slots: { date: Date; time: string }[] = [];
      const today = new Date();
      
      for (let i = 1; i <= 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayOfWeek = checkDate.getDay();

        (availability || []).forEach(a => {
          if (a.day_of_week === dayOfWeek) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const slotKey = `${dateStr}T${a.start_time}`;
            
            if (!bookedSlots.has(slotKey)) {
              slots.push({
                date: new Date(dateStr),
                time: a.start_time
              });
            }
          }
        });
      }

      setAvailableSlots(slots);
    } catch (error: any) {
      console.error('Error loading slots:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar slots disponíveis',
        variant: 'destructive'
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;

    setIsLoading(true);
    try {
      // Combine date and time
      const newDateTime = new Date(selectedSlot.date);
      const [hours, minutes] = selectedSlot.time.split(':');
      newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Update booking with new date/time
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: newDateTime.toISOString(),
          date: selectedSlot.date.toISOString().split('T')[0],
          start_time: selectedSlot.time,
          rescheduled_from: bookingId,
          rescheduled_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Sessão reagendada',
        description: `Nova data: ${selectedSlot.date.toLocaleDateString('pt-PT')} às ${selectedSlot.time}`
      });

      onRescheduleComplete();
      onOpenChange(false);
      setSelectedSlot(null);
    } catch (error: any) {
      console.error('Error rescheduling:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao reagendar sessão',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupSlotsByDate = () => {
    const grouped: Record<string, string[]> = {};
    availableSlots.forEach(slot => {
      const dateKey = slot.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot.time);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reagendar Sessão</DialogTitle>
          <DialogDescription>
            Selecione uma nova data e hora para a sua sessão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isFetching ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                A carregar slots disponíveis...
              </p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhum slot disponível
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, times]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {new Date(date).toLocaleDateString('pt-PT', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {times.map(time => {
                      const isSelected = selectedSlot?.date.toISOString().split('T')[0] === date &&
                        selectedSlot?.time === time;
                      return (
                        <button
                          key={`${date}-${time}`}
                          onClick={() => setSelectedSlot({ date: new Date(date), time })}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-sm transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Clock className="inline h-3 w-3 mr-1" />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedSlot || isLoading}
          >
            {isLoading ? 'A reagendar...' : 'Confirmar Reagendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

