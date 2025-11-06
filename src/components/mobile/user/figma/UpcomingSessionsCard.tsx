import { CalendarClock, Calendar } from 'lucide-react';

interface Booking {
  id: string;
  pillar?: string;
  date?: string;
  time?: string;
  booking_date?: string;
  start_time?: string;
}

interface UpcomingSessionsCardProps {
  upcomingBookings?: Booking[];
  onViewSessions?: () => void;
}

export function UpcomingSessionsCard({ upcomingBookings = [], onViewSessions }: UpcomingSessionsCardProps) {
  if (upcomingBookings.length === 0) {
    return (
      <div className="bg-yellow-50 rounded-3xl p-5 shadow-sm border border-yellow-100">
        <h3 className="text-gray-900 mb-4">Próximas Sessões</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-yellow-100 rounded-full mb-3">
            <CalendarClock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-600">Nenhuma sessão agendada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Próximas Sessões</h3>
        <span className="text-sm text-gray-500">{upcomingBookings.length} agendadas</span>
      </div>
      
      <div className="space-y-3">
        {upcomingBookings.slice(0, 2).map((booking) => (
          <div 
            key={booking.id}
            className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={onViewSessions}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">{booking.pillar || 'Sessão'}</p>
                <p className="text-gray-500 text-sm">
                  {booking.date || booking.booking_date} às {booking.time || booking.start_time}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
