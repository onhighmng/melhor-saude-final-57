import React from 'react';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CalendarStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  pillarName: string;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 5; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 18 && minute === 30) break;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time,
        available: Math.random() > 0.3, // Mock availability
      });
    }
  }
  return slots;
};

export default function CalendarStep({ 
  selectedDate, 
  onDateSelect, 
  selectedTime,
  onTimeSelect,
  onNext, 
  pillarName 
}: CalendarStepProps) {
  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-h2 text-foreground mb-2">Escolha Data e Hora</h2>
        <p className="text-body text-muted-foreground">Selecione quando quer ter a sua sessão de {pillarName}</p>
      </div>

      <div className="flex-1">
        <BookingCalendar
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          selectedTime={selectedTime}
          onTimeSelect={onTimeSelect}
          timeSlots={timeSlots}
          showTimeSelection={true}
        />
      </div>

      {selectedDate && selectedTime && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={onNext}
            size="lg"
            className="px-8"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}