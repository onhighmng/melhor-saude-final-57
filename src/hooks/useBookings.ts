// Mock useBookings hook to replace Supabase calls
import { useState } from 'react';
import { mockBookings } from '@/data/mockData';

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

const mockBookingStats = {
  totalBookings: 15,
  upcomingBookings: 3,
  completedBookings: 12,
  nextAppointment: mockBookings[0]
};

export const useBookings = () => {
  const [allBookings] = useState<Booking[]>(mockBookings);
  const [upcomingBookings] = useState<Booking[]>(mockBookings.slice(0, 3));
  const [bookingStats] = useState(mockBookingStats);
  const [loading] = useState(false);

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