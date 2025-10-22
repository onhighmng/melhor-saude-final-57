import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface ReferralCalendarProps {
  selectedPillar: string;
  providers: any[];
  onSelectSlot: (date: Date, time: string, providerId: string) => void;
}

export const ReferralCalendar = ({
  selectedPillar,
  providers,
  onSelectSlot
}: ReferralCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  // Generate next 7 days
  const generateDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Mock available time slots
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00'
  ];

  // Mock provider availability (simplified)
  const isSlotAvailable = (providerId: string, time: string) => {
    // Random availability for demo
    return Math.random() > 0.3;
  };

  const days = generateDays();

  const handleSlotSelect = (time: string, providerId: string) => {
    setSelectedTime(time);
    setSelectedProvider(providerId);
    onSelectSlot(selectedDate, time, providerId);
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecionar Data
          </h4>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isSelected =
              day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <Button
                key={index}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedDate(day)}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-xs font-normal">
                  {day.toLocaleDateString('pt-PT', { weekday: 'short' })}
                </span>
                <span className="text-lg font-semibold">
                  {day.getDate()}
                </span>
                {isToday && (
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    Hoje
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Provider & Time Slot Selector */}
      <div>
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" />
          Horários Disponíveis
        </h4>

        {providers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Selecione um pilar para ver prestadores disponíveis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="p-4">
                <div className="mb-3">
                  <h5 className="font-medium">{provider.name}</h5>
                  <p className="text-xs text-muted-foreground">
                    {provider.specialties?.join(', ')}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const isAvailable = isSlotAvailable(provider.id, time);
                    const isSelected =
                      selectedTime === time &&
                      selectedProvider === provider.id;

                    return (
                      <Button
                        key={time}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={!isAvailable}
                        onClick={() => handleSlotSelect(time, provider.id)}
                        className="text-xs"
                      >
                        {time}
                      </Button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {selectedTime && selectedProvider && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900">
            ✓ Slot Selecionado
          </p>
          <p className="text-sm text-green-700">
            {selectedDate.toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}{' '}
            às {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
};
