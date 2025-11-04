import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  user_id: string;
  prestador_id: string;
  provider_name: string;
  provider_avatar: string;
  pillar?: string;
  date: string | null;
  booking_date?: string | null; // Raw database field
  time?: string;
  status: string | null;
  session_type: string | null;
  notes: string | null;
  start_time?: string | null;
  end_time?: string | null;
  meeting_link?: string | null;
  rating?: number | null;
  prestadores?: {
    id: string;
    name: string;
    photo_url: string;
  } | null;
}

interface UseBookingsReturn {
  allBookings: Booking[];
  upcomingBookings: Booking[];
  bookingStats: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    nextAppointment: Booking | undefined;
  };
  loading: boolean;
  refetch: () => Promise<void>;
  formatPillarName: (pillar: string) => string;
  getTimeUntilAppointment: (date: string, time?: string) => string;
}

export const useBookings = (): UseBookingsReturn => {
  const { user, isLoading: isAuthLoading } = useAuth(); // Depend on the auth loading state
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    // DO NOT run if auth is loading or there's no user. This is the key fix.
    if (isAuthLoading || !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error} = await supabase
        .from('bookings')
        .select(`
          *,
          prestadores!bookings_prestador_id_fkey (
            id,
            name,
            photo_url
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;

      if (data) {
        console.log('[useBookings] Fetched raw bookings data:', data);
        
        const bookings: Booking[] = data.map((b: any) => ({
          id: b.id,
          user_id: b.user_id,
          prestador_id: b.prestador_id,
          provider_name: b.prestadores?.name || '',
          provider_avatar: b.prestadores?.photo_url || '',
          pillar: b.pillar || undefined,
          date: b.booking_date, // Use booking_date consistently
          booking_date: b.booking_date,
          time: b.start_time || undefined,
          status: b.status,
          session_type: b.meeting_type,
          notes: b.notes,
          start_time: b.start_time,
          end_time: b.end_time,
          meeting_link: b.meeting_link,
          rating: b.rating || null,
          prestadores: b.prestadores
        }));
        
        console.log('[useBookings] Mapped bookings:', bookings);
        console.log('[useBookings] Total bookings:', bookings.length);
        
        setAllBookings(bookings);
      }
    } catch (err) {
      console.error("useBookings Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    fetchBookings();

    if (user?.id) {
      // CRITICAL FIX #6: Realtime meeting link sync
      // Subscribe to ALL changes on user's bookings including meeting_link updates
      const subscription = supabase
        .channel(`booking-updates-for-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('[useBookings] Realtime update received:', payload);
          
          // Show toast notification for meeting link updates
          if (payload.eventType === 'UPDATE' && payload.new?.meeting_link !== payload.old?.meeting_link) {
            const meetingLink = payload.new.meeting_link;
            if (meetingLink) {
              // Toast notification will be handled by the component using this hook
              console.log('[useBookings] Meeting link updated:', meetingLink);
            }
          }
          
          // Refresh bookings
          fetchBookings();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
    return undefined;
  }, [user, isAuthLoading, fetchBookings]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    const upcoming = allBookings.filter(b => {
      const isValidStatus = b.status === 'confirmed' || b.status === 'scheduled' || b.status === 'pending';
      const hasDate = !!b.date;
      const bookingDate = b.date ? new Date(b.date) : null;
      const isFuture = bookingDate ? bookingDate >= now : false;
      
      console.log('[useBookings] Filtering booking:', {
        id: b.id,
        date: b.date,
        status: b.status,
        isValidStatus,
        hasDate,
        isFuture,
        included: isValidStatus && hasDate && isFuture
      });
      
      return isValidStatus && hasDate && isFuture;
    });
    
    console.log('[useBookings] Upcoming bookings:', upcoming.length, upcoming);
    return upcoming;
  }, [allBookings]);

  const bookingStats = useMemo(() => ({
    totalBookings: allBookings.length,
    upcomingBookings: upcomingBookings.length,
    completedBookings: allBookings.filter(b => b.status === 'completed').length,
    nextAppointment: upcomingBookings[0]
  }), [allBookings, upcomingBookings]);

  const formatPillarName = (pillar: string) => {
    const names = {
      'saude_mental': 'Saúde Mental',
      'bem_estar_fisico': 'Bem-Estar Físico',
      'assistencia_financeira': 'Assistência Financeira',
      'assistencia_juridica': 'Assistência Jurídica'
    };
    return names[pillar as keyof typeof names] || pillar;
  };

  const getTimeUntilAppointment = (date: string, time?: string) => {
    const appointmentDateTime = time 
      ? new Date(`${date}T${time}`) 
      : new Date(date);
    const now = new Date();
    const diff = appointmentDateTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Sessão passada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Em ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Em ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hoje';
  };

  return {
    allBookings,
    upcomingBookings,
    bookingStats,
    loading: loading || isAuthLoading, // The hook is loading if auth is loading OR it is fetching
    refetch: fetchBookings,
    formatPillarName,
    getTimeUntilAppointment
  };
};
