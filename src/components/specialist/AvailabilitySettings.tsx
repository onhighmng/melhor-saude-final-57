import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Plus, Trash2, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

interface AvailabilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const weekDays = [
  { key: 'sunday', label: 'Sun', fullLabel: 'Domingo' },
  { key: 'monday', label: 'Mon', fullLabel: 'Segunda' },
  { key: 'tuesday', label: 'Tue', fullLabel: 'Terça' },
  { key: 'wednesday', label: 'Wed', fullLabel: 'Quarta' },
  { key: 'thursday', label: 'Thu', fullLabel: 'Quinta' },
  { key: 'friday', label: 'Fri', fullLabel: 'Sexta' },
  { key: 'saturday', label: 'Sat', fullLabel: 'Sábado' },
];

export function AvailabilitySettings({ open, onOpenChange }: AvailabilitySettingsProps) {
  const { t } = useTranslation();
  
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    sunday: { enabled: false, slots: [] },
    monday: { enabled: true, slots: [{ id: '1', startTime: '07:10 AM', endTime: '08:00 PM' }] },
    tuesday: { enabled: true, slots: [{ id: '2', startTime: '07:10 AM', endTime: '08:00 PM' }] },
    wednesday: { enabled: true, slots: [{ id: '3', startTime: '07:10 AM', endTime: '08:00 PM' }] },
    thursday: { enabled: true, slots: [{ id: '4', startTime: '07:10 AM', endTime: '08:00 PM' }] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
  });

  const [meetingDuration, setMeetingDuration] = useState('50');
  const [durationUnit, setDurationUnit] = useState('minutes');

  const toggleDay = (dayKey: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        slots: !prev[dayKey].enabled && prev[dayKey].slots.length === 0 
          ? [{ id: Date.now().toString(), startTime: '09:00 AM', endTime: '05:00 PM' }]
          : prev[dayKey].slots,
      }
    }));
  };

  const addSlot = (dayKey: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: [...prev[dayKey].slots, { 
          id: Date.now().toString(), 
          startTime: '09:00 AM', 
          endTime: '05:00 PM' 
        }]
      }
    }));
  };

  const removeSlot = (dayKey: string, slotId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const duplicateSlot = (dayKey: string, slotId: string) => {
    const slot = availability[dayKey].slots.find(s => s.id === slotId);
    if (slot) {
      setAvailability(prev => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          slots: [...prev[dayKey].slots, { 
            ...slot, 
            id: Date.now().toString() 
          }]
        }
      }));
    }
  };

  const updateSlotTime = (dayKey: string, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map(slot => 
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">A minha disponibilidade</DialogTitle>
          <DialogDescription>
            Coleção a sua Disponibilidade para o calendário aqui.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Meeting Duration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Duração da reunião</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Define a duração padrão das sessões</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-3">
              <Input
                type="number"
                value={meetingDuration}
                onChange={(e) => setMeetingDuration(e.target.value)}
                className="w-32"
              />
              <Select value={durationUnit} onValueChange={setDurationUnit}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Weekly Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Horas disponíveis Semanal</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure seus horários disponíveis por dia da semana</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-3">
              {weekDays.map((day) => {
                const dayData = availability[day.key];
                
                return (
                  <div key={day.key} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 w-32">
                        <Checkbox
                          checked={dayData.enabled}
                          onCheckedChange={() => toggleDay(day.key)}
                          id={`day-${day.key}`}
                        />
                        <Label 
                          htmlFor={`day-${day.key}`}
                          className="font-medium cursor-pointer"
                        >
                          {day.label}
                        </Label>
                      </div>

                      {!dayData.enabled && (
                        <span className="text-sm text-muted-foreground">Não disponível</span>
                      )}

                      {dayData.enabled && dayData.slots.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSlot(day.key)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar horário
                        </Button>
                      )}
                    </div>

                    {dayData.enabled && dayData.slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-3 ml-36">
                        <Input
                          type="text"
                          value={slot.startTime}
                          onChange={(e) => updateSlotTime(day.key, slot.id, 'startTime', e.target.value)}
                          className="w-36"
                          placeholder="07:10 AM"
                        />
                        <span className="text-sm font-medium">Para</span>
                        <Input
                          type="text"
                          value={slot.endTime}
                          onChange={(e) => updateSlotTime(day.key, slot.id, 'endTime', e.target.value)}
                          className="w-36"
                          placeholder="08:00 PM"
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => addSlot(day.key)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateSlot(day.key, slot.id)}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSlot(day.key, slot.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Guardar disponibilidade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
