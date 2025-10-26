import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  provider_name: string;
  provider_avatar: string;
  pillar: string;
  date: string;
  time: string;
  status: string;
  session_type: string;
  notes: string;
  booking_date?: string;
  prestadores?: {
    name: string;
    pillar: string;
    avatar_url: string;
  };
}

export const useBookings = () => {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            prestadores (
              id,
              user_id,
              profiles (name, avatar_url)
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) throw error;

        if (data) {
          const bookings = data.map(b => ({
            ...b,
            provider_name: b.prestadores?.profiles?.name || '',
            provider_avatar: b.prestadores?.profiles?.avatar_url || ''
          }));
          
          setAllBookings(bookings);
          setUpcomingBookings(bookings.filter(b => 
            b.status === 'confirmed' && new Date(b.date) >= new Date()
          ));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      }
    };

    fetchBookings();

    // Real-time subscription
    const subscription = supabase
      .channel('booking-updates')
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
  }, [user]);

  const bookingStats = {
    totalBookings: 15,
    upcomingBookings: 3,
    completedBookings: 12,
    nextAppointment: upcomingBookings[0]
  };

  const refetch = () => {
    // Mock refetch - do nothing since it's static data
  };

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
      ? new Date(`${date} ${time}`) 
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
    loading,
    refetch,
    formatPillarName,
    getTimeUntilAppointment
  };
};