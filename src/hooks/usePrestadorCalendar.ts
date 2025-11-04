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
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled';
  meetingLink?: string;
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

      // Fetch ALL bookings (same as user profile - no date filtering)
      // This ensures specialists see all sessions including cancelled/completed (shown in grey)
      const bookingsQuery = supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          status,
          pillar,
          session_type,
          meeting_link,
          profiles!bookings_user_id_fkey(name),
          companies!bookings_company_id_fkey(company_name)
        `)
        .eq('prestador_id', prestador.id)
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

      console.log('[usePrestadorCalendar] Raw bookings from DB:', bookings);
      console.log('[usePrestadorCalendar] Total bookings:', bookings?.length || 0);

      // Transform bookings to calendar events
      // Use booking_date OR date field (bookings table has both columns)
      const bookingEvents: PrestadorCalendarEvent[] = (bookings || []).map((booking: any) => {
        const eventDate = booking.booking_date || booking.date;
        console.log('[usePrestadorCalendar] Booking:', booking.id, 'Date:', eventDate, 'Time:', booking.start_time, 'Link:', booking.meeting_link);
        
        return {
          id: booking.id,
          date: eventDate,
          time: booking.start_time || '09:00',
          type: 'session' as const,
          clientName: booking.profiles?.name,
          company: booking.companies?.company_name,
          pillar: booking.pillar,
          status: booking.status as 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rescheduled',
          meetingLink: booking.meeting_link
        };
      }).filter(event => event.date); // Remove events with no date
      
      console.log('[usePrestadorCalendar] Booking events after transform:', bookingEvents);

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

      console.log('[usePrestadorCalendar] All calendar events:', allEvents);
      console.log('[usePrestadorCalendar] Total events:', allEvents.length);

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

    // Set up realtime subscription for bookings changes
    if (profile?.id) {
      const channel = supabase
        .channel('prestador-bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          (payload) => {
            console.log('[usePrestadorCalendar] Booking changed:', payload);
            // Refetch calendar when any booking changes
            fetchCalendarData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);

  return {
    calendarEvents,
    loading,
    error,
    refetch: fetchCalendarData
  };
};
