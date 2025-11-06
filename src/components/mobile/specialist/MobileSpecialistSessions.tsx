import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface Session {
  id: string;
  user_name: string;
  date: string;
  time: string;
  pillar: string;
  status: string;
}

interface SessionsByDate {
  [key: number]: Array<{ color: string; pillar: string }>;
}

export function MobileSpecialistSessions() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsByDate, setSessionsByDate] = useState<SessionsByDate>({});
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(true);

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            start_time,
            pillar,
            status,
            profiles!bookings_user_id_fkey(name)
          `)
          .eq('prestador_id', prestador.id)
          .gte('booking_date', startOfMonth)
          .lte('booking_date', endOfMonth)
          .order('booking_date', { ascending: true });

        if (error) throw error;

        const mappedSessions: Session[] = (bookings || []).map((booking: any) => ({
          id: booking.id,
          user_name: booking.profiles?.name || 'Cliente',
          date: booking.booking_date,
          time: booking.start_time,
          pillar: booking.pillar || 'saude_mental',
          status: booking.status || 'scheduled'
        }));

        setSessions(mappedSessions);

        // Group sessions by day of month
        const grouped: SessionsByDate = {};
        mappedSessions.forEach(session => {
          const day = new Date(session.date).getDate();
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push({
            color: getPillarColor(session.pillar),
            pillar: session.pillar
          });
        });
        setSessionsByDate(grouped);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [profile?.id, currentDate]);

  const getPillarColor = (pillar: string): string => {
    const colors: Record<string, string> = {
      'saude_mental': 'bg-orange-500',
      'mental_health': 'bg-orange-500',
      'assistencia_financeira': 'bg-blue-500',
      'financial': 'bg-blue-500',
      'assistencia_juridica': 'bg-purple-500',
      'legal': 'bg-purple-500',
      'bem_estar_fisico': 'bg-green-500',
      'physical': 'bg-green-500'
    };
    return colors[pillar] || 'bg-gray-500';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekRange = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const startDay = firstDayOfMonth.getDate();
    const endDay = Math.min(startDay + 6, lastDayOfMonth.getDate());
    
    return `Dom, ${startDay} de ${monthNames[currentDate.getMonth()].slice(0, 3)} - Sáb, ${endDay} de ${monthNames[currentDate.getMonth()].slice(0, 3)}, ${currentDate.getFullYear()}`;
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar calendário..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-center text-gray-900 text-xl font-semibold mb-1">
            Calendário Pessoal
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Sessões futuras e passadas com tipo e estado
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-gray-900 font-semibold">
                {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
              </h2>
              <p className="text-sm text-gray-600">
                {getWeekRange()}
              </p>
            </div>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="aspect-square flex flex-col items-center justify-center relative"
                >
                  {day && (
                    <>
                      <span className={`text-sm mb-1 ${
                        (isCurrentMonth && day === today) ? 'text-blue-600 font-semibold' : 'text-gray-900'
                      }`}>
                        {day}
                      </span>
                      {sessionsByDate[day] && (
                        <div className="flex gap-1 absolute bottom-1">
                          {sessionsByDate[day].slice(0, 3).map((session, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${session.color}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today Button */}
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Button 
              variant="outline" 
              className="rounded-full px-6"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tipo de Sessões</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Saúde Mental</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Financeira</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Jurídica</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Bem-Estar</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Disponibilidade</h3>
              <p className="text-xs text-gray-600 mt-1">Aceitar novas sessões agendadas</p>
            </div>
            <div className="relative inline-block w-12 h-7">
              <input 
                type="checkbox" 
                id="availability" 
                className="peer sr-only" 
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
              />
              <label 
                htmlFor="availability" 
                className="block h-full cursor-pointer rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors"
              ></label>
              <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}
