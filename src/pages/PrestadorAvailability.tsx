import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Globe, 
  Settings, 
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Save
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
  unavailable: boolean;
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface Exception {
  id: string;
  date: Date;
  type: 'full_day' | 'partial';
  reason: string;
  slots?: TimeSlot[];
}

// Day names moved to translations

const defaultSlot: TimeSlot = { start: '09:00', end: '17:00' };

const initialSchedule: WeeklySchedule = {
  monday: { enabled: true, slots: [defaultSlot], unavailable: false },
  tuesday: { enabled: true, slots: [defaultSlot], unavailable: false },
  wednesday: { enabled: true, slots: [defaultSlot], unavailable: false },
  thursday: { enabled: true, slots: [defaultSlot], unavailable: false },
  friday: { enabled: true, slots: [defaultSlot], unavailable: false },
  saturday: { enabled: false, slots: [], unavailable: true },
  sunday: { enabled: false, slots: [], unavailable: true }
};

export default function PrestadorAvailability() {
  const { t } = useTranslation('provider');
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [timezone, setTimezone] = useState('Europe/Lisbon');
  const [bufferBefore, setBufferBefore] = useState('15');
  const [bufferAfter, setBufferAfter] = useState('15');
  const [slotDuration, setSlotDuration] = useState('60');
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState('8');
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [selectedExceptionDate, setSelectedExceptionDate] = useState<Date>();
  const [isOnline, setIsOnline] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Mock existing appointments warning
  const hasExistingAppointments = true;

  const updateDaySchedule = (day: keyof WeeklySchedule, updates: Partial<DaySchedule>) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates }
    }));
    setHasUnsavedChanges(true);
  };

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    const daySchedule = schedule[day];
    const newSlot: TimeSlot = { start: '09:00', end: '17:00' };
    
    updateDaySchedule(day, {
      slots: [...daySchedule.slots, newSlot]
    });
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    const daySchedule = schedule[day];
    const newSlots = daySchedule.slots.filter((_, i) => i !== index);
    
    updateDaySchedule(day, {
      slots: newSlots
    });
  };

  const updateTimeSlot = (day: keyof WeeklySchedule, index: number, field: 'start' | 'end', value: string) => {
    const daySchedule = schedule[day];
    const newSlots = daySchedule.slots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    
    updateDaySchedule(day, {
      slots: newSlots
    });

    // Check for conflicts
    checkForConflicts(day, newSlots);
  };

  const checkForConflicts = (day: keyof WeeklySchedule, slots: TimeSlot[]) => {
    const overlaps: string[] = [];
    
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];
        
        if (slot1.start < slot2.end && slot2.start < slot1.end) {
          overlaps.push(`${t('availability.conflictDetected')} ${t(`availability.days.${day}`)}`);
        }
      }
    }
    
    setConflicts(overlaps);
  };

  const toggleDayAvailability = (day: keyof WeeklySchedule) => {
    const daySchedule = schedule[day];
    
    if (daySchedule.unavailable) {
      // Enable day
      updateDaySchedule(day, {
        enabled: true,
        unavailable: false,
        slots: daySchedule.slots.length === 0 ? [defaultSlot] : daySchedule.slots
      });
    } else {
      // Disable day
      updateDaySchedule(day, {
        enabled: false,
        unavailable: true
      });
    }
  };

  const addException = () => {
    if (!selectedExceptionDate) return;
    
    const newException: Exception = {
      id: Date.now().toString(),
      date: selectedExceptionDate,
      type: 'full_day',
      reason: t('availability.unavailable')
    };
    
    setExceptions(prev => [...prev, newException]);
    setSelectedExceptionDate(undefined);
    setHasUnsavedChanges(true);
  };

  const removeException = (id: string) => {
    setExceptions(prev => prev.filter(ex => ex.id !== id));
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      console.log('Availability saved:', { schedule, timezone, bufferBefore, bufferAfter, slotDuration, maxSessionsPerDay, exceptions });
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const resetToDefault = () => {
    setSchedule(initialSchedule);
    setTimezone('Europe/Lisbon');
    setBufferBefore('15');
    setBufferAfter('15');
    setSlotDuration('60');
    setMaxSessionsPerDay('8');
    setExceptions([]);
    setConflicts([]);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={t('availability.title')}
        subtitle={t('availability.subtitle')}
        className="bg-white border-b"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">{t('availability.online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">{t('availability.offline')}</span>
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={resetToDefault}
              className="hidden sm:flex"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('availability.resetButton')}
            </Button>
            <Button 
              onClick={saveChanges}
              disabled={!hasUnsavedChanges}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('availability.saveButton')}
            </Button>
          </div>
        }
      />

      {/* Offline Warning */}
      {!isOnline && (
        <Alert className="mx-4 mt-4 border-gray-200 bg-gray-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            {t('availability.offlineWarning')}
          </AlertDescription>
        </Alert>
      )}

      {/* Existing Appointments Warning */}
      {hasExistingAppointments && (
        <Alert className="mx-4 mt-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {t('availability.existingWarning')}
          </AlertDescription>
        </Alert>
      )}

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {conflicts.map((conflict, index) => (
              <div key={index}>{conflict}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {t('availability.weeklySchedule')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(schedule).map(([dayKey, daySchedule]) => (
              <div key={dayKey} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {t(`availability.days.${dayKey}`)}
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-gray-600">
                      {t('availability.dayUnavailable')}
                    </Label>
                    <Switch
                      checked={daySchedule.unavailable}
                      onCheckedChange={() => toggleDayAvailability(dayKey as keyof WeeklySchedule)}
                    />
                  </div>
                </div>

                {!daySchedule.unavailable && (
                  <div className="space-y-3">
                    {daySchedule.slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-sm w-12">{t('availability.startTime')}</Label>
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(dayKey as keyof WeeklySchedule, index, 'start', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-sm w-12">{t('availability.endTime')}</Label>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(dayKey as keyof WeeklySchedule, index, 'end', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(dayKey as keyof WeeklySchedule, index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={daySchedule.slots.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(dayKey as keyof WeeklySchedule)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('availability.addTimeSlot')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Definições Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Fuso Horário
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Lisbon">Europa/Lisboa (WET)</SelectItem>
                    <SelectItem value="Europe/London">Europa/Londres (GMT)</SelectItem>
                    <SelectItem value="America/New_York">América/Nova York (EST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Ásia/Tóquio (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Buffer Antes (min)
                  </Label>
                  <Select value={bufferBefore} onValueChange={setBufferBefore}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Buffer Depois (min)</Label>
                  <Select value={bufferAfter} onValueChange={setBufferAfter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duração do Slot</Label>
                  <Select value={slotDuration} onValueChange={setSlotDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Máximo por Dia</Label>
                  <Input
                    type="number"
                    value={maxSessionsPerDay}
                    onChange={(e) => {
                      setMaxSessionsPerDay(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exceptions & Holidays */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Exceções & Feriados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Selecionar Data de Exceção</Label>
                <div className="border rounded-lg p-3">
                  <Calendar
                    mode="single"
                    selected={selectedExceptionDate}
                    onSelect={setSelectedExceptionDate}
                    disabled={(date) => date < new Date()}
                    className="w-full pointer-events-auto"
                  />
                </div>
                
                <Button
                  onClick={addException}
                  disabled={!selectedExceptionDate}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Exceção
                </Button>
              </div>

              {/* Exceptions List */}
              {exceptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Exceções Registadas</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {exceptions.map((exception) => (
                      <div
                        key={exception.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {format(exception.date, 'dd/MM/yyyy', { locale: pt })}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {exception.reason}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeException(exception.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
