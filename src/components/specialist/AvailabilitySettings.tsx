import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Plus, Trash2, Copy, Info, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { CalendarWithTimePresets } from '@/components/ui/calendar-with-time-presets';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isFuture, startOfToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

interface BlockedTimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
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

// Generate time slots in 30-minute intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const periods = ['AM', 'PM'];
  
  periods.forEach(period => {
    for (let hour = period === 'AM' ? 12 : 1; hour <= (period === 'AM' ? 12 : 11); hour++) {
      if (period === 'AM' && hour === 12) {
        slots.push('12:00 AM', '12:30 AM');
      } else {
        slots.push(`${hour.toString().padStart(2, '0')}:00 ${period}`);
        slots.push(`${hour.toString().padStart(2, '0')}:30 ${period}`);
      }
    }
  });
  
  // Add midnight at the end
  slots.push('12:00 AM');
  
  return slots;
};

const timeSlots = generateTimeSlots();

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
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | undefined>();
  
  // Blocked time slots
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<BlockedTimeSlot[]>([]);
  const [timeBlockDate, setTimeBlockDate] = useState<Date | undefined>();
  const [timeBlockStart, setTimeBlockStart] = useState('09:00 AM');
  const [timeBlockEnd, setTimeBlockEnd] = useState('10:00 AM');
  
  // Calendar with time presets state
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();
  const [calendarTime, setCalendarTime] = useState<string | null>(null);

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

  const addBlockedDate = (date: Date | undefined) => {
    if (date && isFuture(date)) {
      const dateExists = blockedDates.some(d => 
        d.toDateString() === date.toDateString()
      );
      if (!dateExists) {
        setBlockedDates(prev => [...prev, date].sort((a, b) => a.getTime() - b.getTime()));
      }
      setSelectedBlockDate(undefined);
    }
  };

  const removeBlockedDate = (date: Date) => {
    setBlockedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
  };

  const addBlockedTimeSlot = () => {
    if (timeBlockDate && isFuture(timeBlockDate)) {
      const newSlot: BlockedTimeSlot = {
        id: Date.now().toString(),
        date: timeBlockDate,
        startTime: timeBlockStart,
        endTime: timeBlockEnd,
      };
      setBlockedTimeSlots(prev => [...prev, newSlot].sort((a, b) => a.date.getTime() - b.date.getTime()));
      setTimeBlockDate(undefined);
      setTimeBlockStart('09:00 AM');
      setTimeBlockEnd('10:00 AM');
    }
  };

  const removeBlockedTimeSlot = (id: string) => {
    setBlockedTimeSlots(prev => prev.filter(slot => slot.id !== id));
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

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="weekly">Horários Semanais</TabsTrigger>
            <TabsTrigger value="calendar">Calendário Visual</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
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
                        <Select
                          value={slot.startTime}
                          onValueChange={(value) => updateSlotTime(day.key, slot.id, 'startTime', value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="07:10 AM" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50 max-h-[300px]">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm font-medium">Para</span>
                        <Select
                          value={slot.endTime}
                          onValueChange={(value) => updateSlotTime(day.key, slot.id, 'endTime', value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="08:00 PM" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50 max-h-[300px]">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

          <Separator />

          {/* Blocked Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Datas Bloqueadas</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bloqueie datas específicas em que não estará disponível</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-start gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedBlockDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedBlockDate ? format(selectedBlockDate, "PPP") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedBlockDate}
                    onSelect={setSelectedBlockDate}
                    disabled={(date) => !isFuture(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Button 
                onClick={() => addBlockedDate(selectedBlockDate)}
                disabled={!selectedBlockDate}
              >
                Bloquear Data
              </Button>
            </div>

            {blockedDates.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Datas bloqueadas ({blockedDates.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {blockedDates.map((date, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-2 pr-1 py-1.5"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {format(date, "dd/MM/yyyy")}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeBlockedDate(date)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Blocked Time Slots */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Bloquear Horário Específico</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bloqueie horários específicos em datas futuras</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex flex-col gap-3">
                <div>
                  <Label className="text-sm mb-2 block">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !timeBlockDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {timeBlockDate ? format(timeBlockDate, "PPP") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={timeBlockDate}
                        onSelect={setTimeBlockDate}
                        disabled={(date) => !isFuture(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-2 block">Hora Início</Label>
                    <Select
                      value={timeBlockStart}
                      onValueChange={setTimeBlockStart}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="09:00 AM" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 max-h-[300px]">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">Hora Fim</Label>
                    <Select
                      value={timeBlockEnd}
                      onValueChange={setTimeBlockEnd}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="10:00 AM" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 max-h-[300px]">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={addBlockedTimeSlot}
                  disabled={!timeBlockDate}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Bloqueio de Horário
                </Button>
              </div>
            </div>

            {blockedTimeSlots.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Horários bloqueados ({blockedTimeSlots.length})
                </Label>
                <div className="space-y-2">
                  {blockedTimeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {format(slot.date, "dd/MM/yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeBlockedTimeSlot(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Selecione Data e Horário</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use o calendário para definir sua disponibilidade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <CalendarWithTimePresets
                selectedDate={calendarDate}
                onDateSelect={setCalendarDate}
                selectedTime={calendarTime}
                onTimeSelect={setCalendarTime}
                bookedDates={blockedDates}
                showFooter={true}
                continueButtonText="Adicionar Disponibilidade"
                onContinue={() => {
                  if (calendarDate && calendarTime) {
                    console.log('Disponibilidade adicionada:', calendarDate, calendarTime);
                    setCalendarDate(undefined);
                    setCalendarTime(null);
                  }
                }}
              />
            </div>
          </TabsContent>
        </Tabs>


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
