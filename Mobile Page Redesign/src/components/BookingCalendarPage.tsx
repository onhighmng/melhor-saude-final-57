import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Calendar } from './ui/calendar';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface BookingCalendarPageProps {
  pillar: Pillar;
  sessionType: 'online' | 'phone';
  onBack: () => void;
  onComplete: (date: Date, time: string) => void;
}

export function BookingCalendarPage({ pillar, sessionType, onBack, onComplete }: BookingCalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  const pillarTitles: Record<Pillar, string> = {
    'mental-health': 'Saúde Mental',
    'physical-wellness': 'Bem-estar Físico',
    'financial-assistance': 'Assistência Financeira',
    'legal-assistance': 'Assistência Jurídica'
  };

  // Generate time slots
  const timeSlots = [
    { time: '08:00', available: true },
    { time: '08:30', available: false },
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: false },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: false },
    { time: '16:30', available: true },
    { time: '17:00', available: true }
  ];

  const formatDateHeader = (date: Date | undefined) => {
    if (!date) return '';
    const days = ['domingo', 'segunda feira', 'terça feira', 'quarta feira', 'quinta feira', 'sexta feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onComplete(selectedDate, selectedTime);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="text-center">
            <h1 className="text-gray-900 mb-1">Escolha uma data e horário</h1>
            <p className="text-gray-500 text-sm">
              Selecione quando quer ter a sua sessão de {pillarTitles[pillar]}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="mx-auto"
              disabled={(date) => date < new Date()}
            />
          </div>

          {/* Time Slots Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-gray-900 mb-4">{formatDateHeader(selectedDate)}</h3>
            
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                    selectedTime === slot.time
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : slot.available
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>

            {/* Timezone Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <span>🕐</span>
                Horário de Moçambique GMT+2
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
