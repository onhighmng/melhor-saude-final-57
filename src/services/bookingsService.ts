import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  user_id: string;
  prestador_id: string;
  booking_date: string;
  duration: number;
  status: string;
  session_type: string;
  notes?: string;
  prestador_notes?: string;
  meeting_link?: string;
  created_at: string;
  updated_at: string;
  prestadores?: {
    name: string;
    pillar?: string;
  };
}

class BookingsService {
  async getUserBookings(limit?: number): Promise<Booking[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('bookings')
        .select(`
          *,
          prestadores(name, pillar)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  async getUpcomingBookings(limit: number = 3): Promise<Booking[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          prestadores(name, pillar)
        `)
        .eq('user_id', user.id)
        .gte('booking_date', now)
        .in('status', ['scheduled', 'confirmed'])
        .order('booking_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      return [];
    }
  }

  async getBookingStats(): Promise<{
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    nextAppointment?: Booking;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { 
        totalBookings: 0, 
        upcomingBookings: 0, 
        completedBookings: 0 
      };

      const now = new Date().toISOString();

      // Get all bookings
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select(`
          *,
          prestadores(name, pillar)
        `)
        .eq('user_id', user.id);

      if (allError) throw allError;

      // Get upcoming bookings
      const upcomingBookings = allBookings?.filter(booking => 
        booking.booking_date >= now && 
        ['scheduled', 'confirmed'].includes(booking.status)
      ) || [];

      // Get completed bookings
      const completedBookings = allBookings?.filter(booking => 
        booking.status === 'completed'
      ) || [];

      // Get next appointment
      const nextAppointment = upcomingBookings
        .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())[0];

      return {
        totalBookings: allBookings?.length || 0,
        upcomingBookings: upcomingBookings.length,
        completedBookings: completedBookings.length,
        nextAppointment
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return { 
        totalBookings: 0, 
        upcomingBookings: 0, 
        completedBookings: 0 
      };
    }
  }

  formatPillarName(pillar?: string): string {
    switch (pillar) {
      case 'psicologica':
        return 'Psicológico';
      case 'juridica':
        return 'Jurídico';
      case 'financeira':
        return 'Financeiro';
      case 'fisica':
        return 'Físico';
      default:
        return 'Geral';
    }
  }

  getTimeUntilAppointment(bookingDate: string): string {
    const now = new Date();
    const appointment = new Date(bookingDate);
    const diff = appointment.getTime() - now.getTime();

    if (diff < 0) return 'Passado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

export const bookingsService = new BookingsService();