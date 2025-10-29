import { useState, useEffect } from 'react';
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
  dbId?: string; // Database ID for tracking
}

interface AvailabilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailabilitySettings({ open, onOpenChange }: AvailabilitySettingsProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prestadorId, setPrestadorId] = useState<string | null>(null);
  
  // Unavailable time slots
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  
  // Load existing unavailable slots from database when modal opens
  useEffect(() => {
    if (open && profile?.id) {
      loadUnavailableSlots();
    }
  }, [open, profile?.id]);

  const loadUnavailableSlots = async () => {
    try {
      setLoading(true);
      
      // Get prestador_id
      const { data: prestador } = await supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', profile?.id)
        .single();

      if (!prestador) {
        setLoading(false);
        return;
      }

      setPrestadorId(prestador.id);

      // Load unavailable slots from prestador_schedule (where is_available = false)
      const { data: scheduleData, error } = await supabase
        .from('prestador_schedule')
        .select('id, date, start_time')
        .eq('prestador_id', prestador.id)
        .eq('is_available', false)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading unavailable slots:', error);
        setLoading(false);
        return;
      }

      // Transform database data to component format
      const slots: UnavailableSlot[] = (scheduleData || []).map(slot => ({
        id: slot.id,
        date: new Date(slot.date),
        time: slot.start_time || '00:00',
        dbId: slot.id
      }));

      setUnavailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os horários indisponíveis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const removeUnavailableSlot = (id: string) => {
    setUnavailableSlots(prev => prev.filter(slot => slot.id !== id));
    toast({
      title: "Horário removido",
      description: "O horário foi marcado como disponível novamente",
    });
  };

  const handleSave = async () => {
    if (!prestadorId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o prestador",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // First, delete all existing unavailable slots for this prestador
      await supabase
        .from('prestador_schedule')
        .delete()
        .eq('prestador_id', prestadorId)
        .eq('is_available', false);

      // Then, insert new unavailable slots
      const slotsToInsert = unavailableSlots
        .filter(slot => !slot.dbId) // Only insert new ones (not already in DB)
        .map(slot => ({
          prestador_id: prestadorId,
          date: format(slot.date, 'yyyy-MM-dd'),
          start_time: slot.time,
          end_time: slot.time, // Use same time for now (can be enhanced to support time ranges)
          is_available: false
        }));

      if (slotsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('prestador_schedule')
          .insert(slotsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Indisponibilidade guardada",
        description: `${unavailableSlots.length} horário(s) marcado(s) como indisponível`,
      });

      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao guardar indisponibilidade';
      console.error('Error saving availability:', error);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
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
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || loading}
          >
            {isSaving ? 'A guardar...' : 'Guardar Indisponibilidade'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
