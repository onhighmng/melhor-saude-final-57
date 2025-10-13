import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProviders, AdminProvider } from '@/data/adminMockData';
import { useTranslation } from 'react-i18next';
import { BookingModal } from '@/components/admin/providers/BookingModal';
import { CalendarSlot } from '@/types/adminProvider';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';

// Generate mock calendar slots
const generateMockSlots = (startDate: Date, pillar: string): CalendarSlot[] => {
  const slots: CalendarSlot[] = [];
  const hours = [9, 10, 11, 14, 15, 16, 17];

  for (let day = 0; day < 7; day++) {
    const date = addDays(startDate, day);
    hours.forEach((hour) => {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      const isBooked = Math.random() > 0.7;
      
      slots.push({
        id: `${day}-${hour}`,
        date: slotDate,
        isAvailable: !isBooked,
        ...(isBooked ? {
          bookingId: `booking-${day}-${hour}`,
          collaboratorName: ['João Silva', 'Maria Santos', 'Pedro Costa'][Math.floor(Math.random() * 3)],
          company: ['TechCorp', 'HealthPlus', 'StartupHub'][Math.floor(Math.random() * 3)],
          sessionType: ['virtual', 'presential'][Math.floor(Math.random() * 2)] as 'virtual' | 'presential',
        } : {}),
      });
    });
  }
  
  return slots;
};

const AdminProviderCalendar = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('admin-providers');
  const [provider, setProvider] = useState<AdminProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: pt }));
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const loadProvider = () => {
      const foundProvider = mockProviders.find(p => p.id === providerId);
      setProvider(foundProvider || null);
      setIsLoading(false);
    };

    loadProvider();
  }, [providerId]);

  const handleBack = () => {
    navigate('/admin/users-management');
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleSlotClick = (slot: CalendarSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setBookingModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Prestador não encontrado</p>
        </div>
      </div>
    );
  }

  const slots = generateMockSlots(currentWeekStart, provider.pillar);
  const weekEnd = endOfWeek(currentWeekStart, { locale: pt });
  const hours = [9, 10, 11, 14, 15, 16, 17];
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {t('calendarView.providerCalendar', { providerName: provider.name })}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {provider.specialty} • {provider.pillar}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[200px] text-center">
              {format(currentWeekStart, "d MMM", { locale: pt })} - {format(weekEnd, "d MMM yyyy", { locale: pt })}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('calendarView.filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('calendarView.allTypes')}</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="presential">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm text-muted-foreground">{t('calendarView.available')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-sm text-muted-foreground">{t('calendarView.booked')}</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Days header */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs font-medium text-muted-foreground"></div>
              {weekDays.map((day, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(day, 'EEE', { locale: pt })}
                  </div>
                  <div className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
                <div className="text-xs font-medium text-muted-foreground py-2">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slot = slots.find(s => 
                    s.date.getHours() === hour && 
                    isSameDay(s.date, day)
                  );
                  
                  if (!slot) return <div key={dayIndex} className="min-h-[60px]" />;
                  
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!slot.isAvailable}
                      className={`min-h-[60px] p-2 rounded-lg border-2 text-left transition-all ${
                        slot.isAvailable
                          ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer'
                          : 'bg-blue-50 border-blue-200 cursor-default'
                      }`}
                    >
                      {!slot.isAvailable && slot.collaboratorName && (
                        <div className="text-xs">
                          <div className="font-medium truncate">{slot.collaboratorName}</div>
                          <div className="text-muted-foreground truncate">{slot.company}</div>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {slot.sessionType}
                          </Badge>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {t('calendarView.selectSlot')}
        </p>
      </Card>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          provider={provider}
          slot={selectedSlot}
        />
      )}
    </div>
  );
};

export default AdminProviderCalendar;
