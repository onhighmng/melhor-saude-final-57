import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PrestadorCalendarEvent {
  id: string;
  date: string;
  time: string;
  type: 'available' | 'session' | 'blocked';
  clientName?: string;
  company?: string;
  pillar?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

interface UsePrestadorCalendarReturn {
  calendarEvents: PrestadorCalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePrestadorCalendar = (): UsePrestadorCalendarReturn => {
  const { profile } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState<PrestadorCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get prestador ID from profile
      const { data: prestador, error: prestadorError } = await supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (prestadorError) throw prestadorError;
      if (!prestador) {
        setError('Prestador não encontrado');
        setLoading(false);
        return;
      }

      // Fetch bookings for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          date,
          start_time,
          status,
          pillar,
          session_type,
          profiles!bookings_user_id_fkey(name),
          companies!bookings_company_id_fkey(company_name)
        `)
        .eq('prestador_id', prestador.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (bookingsError) throw bookingsError;

      // Fetch availability slots
      const { data: availability, error: availabilityError } = await supabase
        .from('prestador_availability')
        .select('*')
        .eq('prestador_id', prestador.id);

      if (availabilityError) throw availabilityError;

      // Transform bookings to calendar events
      const bookingEvents: PrestadorCalendarEvent[] = (bookings || []).map(booking => ({
        id: booking.id,
        date: booking.date,
        time: booking.start_time || '09:00',
        type: 'session' as const,
        clientName: (booking.profiles as any)?.name,
        company: (booking.companies as any)?.company_name,
        pillar: booking.pillar,
        status: booking.status as 'confirmed' | 'pending' | 'cancelled'
      }));

      // Transform availability to calendar events
      const availabilityEvents: PrestadorCalendarEvent[] = (availability || []).map(slot => ({
        id: `availability-${slot.id}`,
        date: slot.date,
        time: slot.start_time,
        type: slot.is_available ? 'available' as const : 'blocked' as const
      }));

      // Combine and sort events
      const allEvents = [...bookingEvents, ...availabilityEvents].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });

      setCalendarEvents(allEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do calendário';
      setError(errorMessage);
      console.error('Error fetching prestador calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [profile?.id]);

  return {
    calendarEvents,
    loading,
    error,
    refetch: fetchCalendarData
  };
};
