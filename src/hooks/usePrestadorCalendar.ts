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
          booking_date,
          start_time,
          status,
          pillar,
          session_type,
          profiles!bookings_user_id_fkey(name),
          companies!bookings_company_id_fkey(company_name)
        `)
        .eq('prestador_id', prestador.id)
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .lte('booking_date', endDate.toISOString().split('T')[0])
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      // Fetch prestador data to get blocked_dates
      const prestadorDataQuery = supabase
        .from('prestadores')
        .select('blocked_dates')
        .eq('id', prestador.id)
        .single();

      // Fetch both in parallel with timeout
      const [bookingsResult, prestadorDataResult] = await Promise.allSettled([
        Promise.race([bookingsQuery, new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))]),
        Promise.race([prestadorDataQuery, new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))])
      ]);

      const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value.data : [];
      const prestadorData = prestadorDataResult.status === 'fulfilled' ? prestadorDataResult.value.data : null;

      // Transform bookings to calendar events
      const bookingEvents: PrestadorCalendarEvent[] = (bookings || []).map((booking: any) => ({
        id: booking.id,
        date: booking.booking_date,
        time: booking.start_time || '09:00',
        type: 'session' as const,
        clientName: booking.profiles?.name,
        company: booking.companies?.company_name,
        pillar: booking.pillar,
        status: booking.status as 'confirmed' | 'pending' | 'cancelled'
      }));

      // Transform blocked dates from prestadores table to calendar events
      // Format: [{"date": "2024-01-15", "times": ["10:00", "14:00"]}, ...]
      const blockedDates = prestadorData?.blocked_dates || [];
      const blockedEvents: PrestadorCalendarEvent[] = [];
      
      if (Array.isArray(blockedDates)) {
        blockedDates.forEach((blockedSlot: any) => {
          if (blockedSlot.date && Array.isArray(blockedSlot.times)) {
            blockedSlot.times.forEach((time: string) => {
              blockedEvents.push({
                id: `blocked-${blockedSlot.date}-${time}`,
                date: blockedSlot.date,
                time: time,
                type: 'blocked' as const
              });
            });
          }
        });
      }

      // Combine and sort events
      const allEvents = [...bookingEvents, ...blockedEvents].sort((a, b) => {
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
