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
  time?: string;
  status: string | null;
  session_type: string | null;
  notes: string | null;
  start_time?: string | null;
  end_time?: string | null;
  booking_date: string;
  meeting_link?: string | null;
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
      const { data, error } = await supabase
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
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        const bookings: Booking[] = data.map(b => ({
          ...b,
          provider_name: b.prestadores?.name || '',
          provider_avatar: b.prestadores?.photo_url || '',
          time: b.start_time || '',
          pillar: b.pillar || ''
        }));
        
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
      const subscription = supabase
        .channel(`booking-updates-for-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchBookings();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
    return undefined;
  }, [user, isAuthLoading, fetchBookings]);

  const upcomingBookings = useMemo(() => 
    allBookings.filter(b => 
      (b.status === 'confirmed' || b.status === 'scheduled') && b.date && new Date(b.date) >= new Date()
    ), [allBookings]);

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
