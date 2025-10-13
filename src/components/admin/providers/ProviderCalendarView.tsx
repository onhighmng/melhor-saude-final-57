import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminProvider } from '@/data/adminMockData';
import { CalendarSlot } from '@/types/adminProvider';
import { BookingModal } from './BookingModal';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ProviderCalendarViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AdminProvider | null;
  onBack: () => void;
}

const pillarColors: Record<string, string> = {
  'mental_health': 'bg-royal-blue/20 border-royal-blue',
  'physical_wellness': 'bg-mint-green/20 border-mint-green',
  'financial_assistance': 'bg-peach-orange/20 border-peach-orange',
  'legal_assistance': 'bg-sky-blue/20 border-sky-blue',
};

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
        bookingId: isBooked ? `booking-${day}-${hour}` : undefined,
        collaboratorName: isBooked ? ['Ana Silva', 'João Santos', 'Maria Costa'][Math.floor(Math.random() * 3)] : undefined,
        company: isBooked ? ['TechCorp', 'HealthPlus', 'FinanceHub'][Math.floor(Math.random() * 3)] : undefined,
        sessionType: isBooked ? (Math.random() > 0.5 ? 'virtual' : 'presential') : undefined,
      });
    });
  }

  return slots;
};

export const ProviderCalendarView = ({
  open,
  onOpenChange,
  provider,
  onBack,
}: ProviderCalendarViewProps) => {
  const { t } = useTranslation('admin-providers');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: pt }));
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  if (!provider) return null;

  const slots = generateMockSlots(currentWeekStart, provider.pillar);
  const weekEnd = endOfWeek(currentWeekStart, { locale: pt });

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

  const hours = [9, 10, 11, 14, 15, 16, 17];
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>{t('calendarView.title')}</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('calendarView.providerCalendar', { providerName: provider.name })}
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  {t('calendarView.weekView')}
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  disabled
                >
                  {t('calendarView.monthView')}
                </Button>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('calendarView.filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('calendarView.allTypes')}</SelectItem>
                  <SelectItem value="virtual">{t('sessionTypes.virtual')}</SelectItem>
                  <SelectItem value="presential">{t('sessionTypes.presential')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('calendarView.filterByCompany')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('calendarView.allCompanies')}</SelectItem>
                  <SelectItem value="techcorp">TechCorp</SelectItem>
                  <SelectItem value="healthplus">HealthPlus</SelectItem>
                  <SelectItem value="financehub">FinanceHub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success/20 border border-success rounded"></div>
                <span className="text-muted-foreground">{t('calendarView.available')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 ${pillarColors[provider.pillar]} rounded`}></div>
                <span className="text-muted-foreground">{t('calendarView.booked')}</span>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold">
                {format(currentWeekStart, 'd MMM', { locale: pt })} - {format(weekEnd, 'd MMM yyyy', { locale: pt })}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-8 border-b">
                    <div className="p-2 border-r bg-muted/50 font-semibold text-sm"></div>
                    {weekDays.map((day, i) => (
                      <div key={i} className="p-2 border-r bg-muted/50 text-center">
                        <div className="font-semibold text-sm">
                          {format(day, 'EEE', { locale: pt })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(day, 'd MMM', { locale: pt })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 border-r bg-muted/30 text-sm font-medium text-center">
                        {hour}:00
                      </div>
                      {weekDays.map((day, dayIndex) => {
                        const slot = slots.find(
                          (s) => s.date.getHours() === hour && isSameDay(s.date, day)
                        );

                        return (
                          <div
                            key={dayIndex}
                            className={`p-1 border-r cursor-pointer transition-all hover:bg-muted/30 ${
                              slot?.isAvailable
                                ? 'bg-success/10 hover:bg-success/20'
                                : slot
                                ? `${pillarColors[provider.pillar]}`
                                : 'bg-muted/10'
                            }`}
                            onClick={() => slot && handleSlotClick(slot)}
                          >
                            {slot && !slot.isAvailable && (
                              <div className="text-xs p-1">
                                <div className="font-medium truncate">{slot.collaboratorName}</div>
                                <Badge variant="outline" className="text-[10px] mt-1">
                                  {t('sessionTypes.' + slot.sessionType)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              {t('calendarView.selectSlot')}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {selectedSlot && (
        <BookingModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          provider={provider}
          slot={selectedSlot}
        />
      )}
    </>
  );
};
