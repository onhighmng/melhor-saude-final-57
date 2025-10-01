import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { pt } from 'date-fns/locale';

interface SessionDetailsStepProps {
  selectedDate: Date;
  selectedTime: string;
  selectedDuration: number;
  objective: string;
  onTimeSelect: (time: string) => void;
  onDurationSelect: (duration: number) => void;
  onObjectiveChange: (objective: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isBooking: boolean;
  pillarName: string;
}

const durations = [
  { value: 30, label: '30 minutos', description: 'Sessão breve' },
  { value: 50, label: '50 minutos', description: 'Sessão padrão' },
  { value: 90, label: '90 minutos', description: 'Sessão estendida' }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function SessionDetailsStep({
  selectedDate,
  selectedTime,
  selectedDuration,
  objective,
  onTimeSelect,
  onDurationSelect,
  onObjectiveChange,
  onConfirm,
  onBack,
  isBooking,
  pillarName
}: SessionDetailsStepProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    setLoadingSlots(true);
    // Simulate API call
    setTimeout(() => {
      setAvailableSlots(timeSlots);
      setLoadingSlots(false);
    }, 500);
  }, [selectedDate]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Detalhes da Sessão</h2>
          <p className="text-gray-600">
            {format(selectedDate, "d 'de' MMMM, yyyy", { locale: pt })} • {pillarName}
            {isToday(selectedDate) && (
              <Badge className="ml-2 bg-emerald-100 text-emerald-700">Hoje</Badge>
            )}
          </p>
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Duration Selection */}
        <Card className="border-0 shadow-lg bg-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Duração da Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {durations.map((duration) => (
              <Button
                key={duration.value}
                variant={selectedDuration === duration.value ? "default" : "outline"}
                onClick={() => onDurationSelect(duration.value)}
                className={`w-full h-16 justify-start text-left ${
                  selectedDuration === duration.value 
                    ? "bg-emerald-green hover:bg-emerald-green/90 text-white shadow-md" 
                    : "hover:bg-emerald-50 hover:border-emerald-200"
                }`}
              >
                <Clock className="h-5 w-5 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{duration.label}</span>
                  <span className="text-xs opacity-75">{duration.description}</span>
                </div>
                {selectedDuration === duration.value && (
                  <CheckCircle className="h-4 w-4 ml-auto" />
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card className="border-0 shadow-lg bg-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-green" />
              Horários Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSlots ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => onTimeSelect(time)}
                    className={`h-12 ${
                      selectedTime === time 
                        ? "bg-emerald-green hover:bg-emerald-green/90 text-white shadow-md" 
                        : "hover:bg-emerald-50 hover:border-emerald-200"
                    }`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Objective */}
      {selectedDuration && selectedTime && (
        <Card className="border-0 shadow-lg bg-white mt-8">
          <CardContent className="p-6">
            <Label htmlFor="objective" className="text-sm font-medium text-gray-700 mb-3 block">
              Objetivo principal desta sessão (opcional)
            </Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => onObjectiveChange(e.target.value)}
              placeholder="Descreva brevemente o que gostaria de abordar nesta consulta..."
              className="min-h-[80px] resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      {selectedDuration && selectedTime && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={onConfirm}
            disabled={isBooking}
            size="lg"
            className="bg-emerald-green hover:bg-emerald-green/90 px-12"
          >
            {isBooking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-3" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}