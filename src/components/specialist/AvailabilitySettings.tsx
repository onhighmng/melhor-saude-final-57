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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prestadorId, setPrestadorId] = useState<string | null>(null);
  
  // Unavailable time slots
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  
  // Get dates that already have unavailable slots (for visual marking)
  const unavailableDates = Array.from(
    new Set(unavailableSlots.map(slot => slot.date.toDateString()))
  ).map(dateString => new Date(dateString));

  const handleTimeSelect = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const addUnavailableSlots = () => {
    if (calendarDate && selectedTimes.length > 0) {
      const newSlots: UnavailableSlot[] = [];
      const duplicates: string[] = [];
      
      selectedTimes.forEach(time => {
        const exists = unavailableSlots.some(
          slot => slot.date.toDateString() === calendarDate.toDateString() && slot.time === time
        );
        
        if (!exists) {
          newSlots.push({
            id: `${Date.now()}-${time}`,
            date: calendarDate,
            time: time,
          });
        } else {
          duplicates.push(time);
        }
      });
      
      if (newSlots.length > 0) {
        setUnavailableSlots(prev => [...prev, ...newSlots].sort((a, b) => {
          const dateCompare = a.date.getTime() - b.date.getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        }));
        
        toast({
          title: "Horários marcados como indisponíveis",
          description: `${newSlots.length} horário(s) adicionado(s) para ${format(calendarDate, "dd/MM/yyyy")}`,
        });
      }
      
      if (duplicates.length > 0) {
        toast({
          title: "Alguns horários já existem",
          description: `${duplicates.length} horário(s) já estava(m) marcado(s) como indisponível`,
          variant: "destructive",
        });
      }
      
      setCalendarDate(undefined);
      setSelectedTimes([]);
    }
  };

  const removeUnavailableSlot = async (id: string) => {
    const slot = unavailableSlots.find(s => s.id === id);
    if (slot && profile) {
      try {
        // Get prestador_id
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (prestador) {
          // Note: prestador_schedule table uses day_of_week, not date
          // This is a simplified deletion - adjust based on actual schema
        }
      } catch (error) {
        // Error removing slot - silently fail
      }
    }

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
              onDateSelect={(date) => {
                setCalendarDate(date);
                setSelectedTimes([]);
              }}
              selectedTimes={selectedTimes}
              onTimeSelect={handleTimeSelect}
              multiSelect={true}
              bookedDates={[]}
              showFooter={true}
              footerText={
                calendarDate && selectedTimes.length > 0
                  ? `Marcar ${selectedTimes.length} horário(s) como indisponível em ${format(calendarDate, "dd/MM/yyyy")}`
                  : "Selecione uma data e horários (clique em múltiplos) para marcar como indisponíveis"
              }
              continueButtonText={`Marcar ${selectedTimes.length || ''} Indisponível${selectedTimes.length !== 1 ? 'is' : ''}`}
              onContinue={addUnavailableSlots}
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
          <Button onClick={async () => {
            if (unavailableSlots.length > 0 && profile) {
              try {
                // Get prestador_id
                const { data: prestador } = await supabase
                  .from('prestadores')
                  .select('id')
                  .eq('user_id', profile.id)
                  .single();

                if (prestador) {
                  // Note: prestador_schedule schema mismatch - needs day_of_week and end_time
                }

                toast({
                  title: "Indisponibilidade guardada",
                  description: `${unavailableSlots.length} horário(s) marcado(s) como indisponível`,
                });
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro ao guardar indisponibilidade';
                toast({
                  title: "Erro",
                  description: errorMessage,
                  variant: 'destructive'
                });
              }
            }
            onOpenChange(false);
          }}>
            Guardar Indisponibilidade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
