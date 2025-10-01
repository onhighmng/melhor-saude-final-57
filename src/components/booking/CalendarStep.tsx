import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { format, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha uma Data</h2>
        <p className="text-gray-600">Selecione o dia para a sua sessão de {pillarName}</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white max-w-md w-full">
          <CardHeader className="pb-4 bg-gradient-to-r from-emerald-green to-emerald-green/80 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2 justify-center">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: pt }) : "Selecionar Data"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => isBefore(date, new Date())}
              className="w-full border-0"
              classNames={{
                months: "flex flex-col w-full",
                month: "space-y-4 w-full p-4",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-lg font-semibold text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button: "h-8 w-8 bg-gray-100 hover:bg-gray-200 p-0 rounded-lg transition-colors",
                nav_button_previous: "absolute left-4",
                nav_button_next: "absolute right-4",
                table: "w-full border-collapse",
                head_row: "flex w-full mb-2",
                head_cell: "text-gray-400 rounded-md w-full font-medium text-sm text-center py-2",
                row: "flex w-full mt-1",
                cell: "relative p-1 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                day: "h-10 w-full p-0 font-medium hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-105",
                day_selected: "bg-emerald-green text-white hover:bg-emerald-green hover:text-white shadow-lg scale-105",
                day_today: "bg-blue-50 text-blue-600 font-bold border border-blue-200",
                day_outside: "text-gray-300 opacity-50",
                day_disabled: "text-gray-200 opacity-30 cursor-not-allowed",
                day_hidden: "invisible"
              }}
              locale={pt}
            />
          </CardContent>
        </Card>
      </div>

      {selectedDate && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={onNext}
            size="lg"
            className="bg-emerald-green hover:bg-emerald-green/90 px-8"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}