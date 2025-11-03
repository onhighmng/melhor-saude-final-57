import React from 'react';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useProviderAvailability } from '@/hooks/useProviderAvailability';

interface CalendarStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack?: () => void;
  pillarName: string;
  providerId?: string | null; // Add provider ID to fetch real availability
}

export default function CalendarStep({ 
  selectedDate, 
  onDateSelect, 
  selectedTime,
  onTimeSelect,
  onNext, 
  onBack,
  pillarName,
  providerId
}: CalendarStepProps) {
  // Fetch real availability from backend
  const { availableSlots, loading } = useProviderAvailability(providerId || null, selectedDate);

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
          timeSlots={availableSlots}
          showTimeSelection={true}
        />
        {loading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            A carregar disponibilidade...
          </div>
        )}
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