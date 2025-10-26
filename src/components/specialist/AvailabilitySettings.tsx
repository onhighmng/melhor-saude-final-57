import { useState } from 'react';
import { Info, Calendar as CalendarIcon, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarWithTimePresets } from '@/components/ui/calendar-with-time-presets';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface UnavailableSlot {
  id: string;
  date: Date;
  time: string;
}

interface AvailabilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailabilitySettings({ open, onOpenChange }: AvailabilitySettingsProps) {
  const { toast } = useToast();
  
  // Unavailable time slots
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();
  const [calendarTime, setCalendarTime] = useState<string | null>(null);
  
  // Get dates that already have unavailable slots (for visual marking)
  const unavailableDates = Array.from(
    new Set(unavailableSlots.map(slot => slot.date.toDateString()))
  ).map(dateString => new Date(dateString));

  const addUnavailableSlot = () => {
    if (calendarDate && calendarTime) {
      // Check if this exact slot already exists
      const exists = unavailableSlots.some(
        slot => slot.date.toDateString() === calendarDate.toDateString() && slot.time === calendarTime
      );
      
      if (exists) {
        toast({
          title: "Horário já marcado",
          description: "Este horário já está marcado como indisponível",
          variant: "destructive",
        });
        return;
      }
      
      const newSlot: UnavailableSlot = {
        id: Date.now().toString(),
        date: calendarDate,
        time: calendarTime,
      };
      setUnavailableSlots(prev => [...prev, newSlot].sort((a, b) => a.date.getTime() - b.date.getTime()));
      setCalendarDate(undefined);
      setCalendarTime(null);
      
      toast({
        title: "Horário marcado como indisponível",
        description: `${format(calendarDate, "dd/MM/yyyy")} às ${calendarTime}`,
      });
    }
  };

  const removeUnavailableSlot = (id: string) => {
    setUnavailableSlots(prev => prev.filter(slot => slot.id !== id));
    toast({
      title: "Horário removido",
      description: "O horário foi marcado como disponível novamente",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Gerir Indisponibilidade</DialogTitle>
          <DialogDescription>
            Marque os horários em que não estará disponível para sessões
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar with Time Presets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Selecionar Data e Horário Indisponível</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique numa data e depois num horário para marcar como indisponível</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <CalendarWithTimePresets
              selectedDate={calendarDate}
              onDateSelect={setCalendarDate}
              selectedTime={calendarTime}
              onTimeSelect={setCalendarTime}
              bookedDates={[]}
              showFooter={true}
              footerText={
                calendarDate && calendarTime
                  ? `Marcar como indisponível: ${format(calendarDate, "dd/MM/yyyy")} às ${calendarTime}`
                  : "Selecione uma data e horário para marcar como indisponível"
              }
              continueButtonText="Marcar Indisponível"
              onContinue={addUnavailableSlot}
            />
          </div>

          {/* List of Unavailable Slots */}
          {unavailableSlots.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Horários Indisponíveis ({unavailableSlots.length})
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUnavailableSlots([]);
                      toast({
                        title: "Todos os horários removidos",
                        description: "Todos os horários foram marcados como disponíveis",
                      });
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Limpar todos
                  </Button>
                </div>
                
                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {unavailableSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {format(slot.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: require('date-fns/locale/pt') })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeUnavailableSlot(slot.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            toast({
              title: "Indisponibilidade guardada",
              description: `${unavailableSlots.length} horário(s) marcado(s) como indisponível`,
            });
            onOpenChange(false);
          }}>
            Guardar Indisponibilidade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
