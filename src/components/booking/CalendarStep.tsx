import React from 'react';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CalendarStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onNext: () => void;
  pillarName: string;
}

export default function CalendarStep({ selectedDate, onDateSelect, onNext, pillarName }: CalendarStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-h2 text-foreground mb-2">Escolha uma Data</h2>
        <p className="text-body text-muted-foreground">Selecione o dia para a sua sessão de {pillarName}</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <BookingCalendar
          title="Selecione a data da sua sessão"
          description={`Agendamento para ${pillarName}`}
          showBookButton={false}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          className="max-w-2xl w-full"
        />
      </div>

      {selectedDate && (
        <div className="mt-8 flex justify-center">
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