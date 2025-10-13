import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

// Mock bookings data
const mockBookings = [
  { date: '2025-10-15', collaborator: 'Ana Silva', specialist: 'Dr. João Costa', type: 'virtual', time: '10:00' },
  { date: '2025-10-16', collaborator: 'Carlos Santos', specialist: 'Dra. Maria Oliveira', type: 'presencial', time: '14:30' },
  { date: '2025-10-17', collaborator: 'Daniel Rocha', specialist: 'Dra. Sofia Martins', type: 'virtual', time: '09:00' },
  { date: '2025-10-18', collaborator: 'Eva Pereira', specialist: 'Dr. Pedro Alves', type: 'presencial', time: '16:00' },
  { date: '2025-10-20', collaborator: 'Fernando Lima', specialist: 'Dra. Clara Nunes', type: 'virtual', time: '11:30' },
];

export default function AdminBookingsTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const bookingsForSelectedDate = mockBookings.filter(booking =>
    isSameDay(parseISO(booking.date), selectedDate)
  );

  const datesWithBookings = mockBookings.map(b => parseISO(b.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Agendamentos
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy', { locale: pt })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border w-full"
            modifiers={{
              booked: datesWithBookings,
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: 'hsl(var(--vibrant-blue) / 0.1)',
                fontWeight: 'bold',
              },
            }}
          />
          
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-vibrant-blue/10 border-2 border-vibrant-blue"></div>
              <span className="text-muted-foreground">Com agendamentos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, "d 'de' MMMM", { locale: pt })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Sem agendamentos neste dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsForSelectedDate.map((booking, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{booking.time}</span>
                    <Badge
                      variant="outline"
                      className={
                        booking.type === 'virtual'
                          ? 'bg-vibrant-blue/10 text-vibrant-blue border-vibrant-blue/20'
                          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      }
                    >
                      {booking.type === 'virtual' ? 'Virtual' : 'Presencial'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{booking.collaborator}</p>
                  <p className="text-xs text-muted-foreground">{booking.specialist}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
