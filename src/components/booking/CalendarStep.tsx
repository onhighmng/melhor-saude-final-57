import React from 'react';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface CalendarStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack?: () => void;
  pillarName: string;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 17 && minute === 30) break;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time,
        available: Math.random() > 0.2, // Most slots available with some randomness
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
  onBack,
  pillarName 
}: CalendarStepProps) {
  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Escolha uma data e horário
            </h2>
            <p className="text-gray-600">Selecione quando quer ter a sua sessão de {pillarName}</p>
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Booking Calendar */}
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

      {/* Continue Button */}
      {selectedDate && selectedTime && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={onNext}
            size="lg"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 hover:text-white text-white font-semibold rounded-lg shadow-sm"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}