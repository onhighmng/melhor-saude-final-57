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
      setCalendarEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get prestador ID from profile with timeout
      const prestadorQuery = supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      const { data: prestador, error: prestadorError } = await Promise.race([
        prestadorQuery,
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 3000)
        )
      ]);

      if (prestadorError || !prestador) {
        // Silently fail - just show empty calendar
        console.warn('[usePrestadorCalendar] No prestador found or query failed, showing empty calendar');
        setCalendarEvents([]);
        setLoading(false);
        return;
      }

      // Fetch bookings for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const bookingsQuery = supabase
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

      const availabilityQuery = supabase
        .from('prestador_availability')
        .select('*')
        .eq('prestador_id', prestador.id);

      // Fetch both in parallel with timeout
      const [bookingsResult, availabilityResult] = await Promise.allSettled([
        Promise.race([bookingsQuery, new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))]),
        Promise.race([availabilityQuery, new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))])
      ]);

      const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value.data : [];
      const availability = availabilityResult.status === 'fulfilled' ? availabilityResult.value.data : [];

      // Transform bookings to calendar events
      const bookingEvents: PrestadorCalendarEvent[] = (bookings || []).map((booking: any) => ({
        id: booking.id,
        date: booking.date,
        time: booking.start_time || '09:00',
        type: 'session' as const,
        clientName: booking.profiles?.name,
        company: booking.companies?.company_name,
        pillar: booking.pillar,
        status: booking.status as 'confirmed' | 'pending' | 'cancelled'
      }));

      // Transform availability to calendar events
      const availabilityEvents: PrestadorCalendarEvent[] = (availability || []).map((slot: any) => ({
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
      // Silently fail - just show empty calendar, no error UI
      console.warn('[usePrestadorCalendar] Error fetching calendar data, showing empty calendar:', err);
      setCalendarEvents([]);
      setError(null); // Don't show error to user, just empty calendar
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
