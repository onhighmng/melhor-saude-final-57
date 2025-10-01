import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import SessionManagement from './SessionManagement';
import SessionDeductionGuide from './SessionDeductionGuide';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  duration: number;
  session_type: string;
  status: string;
  notes?: string;
  prestador_notes?: string;
  session_usage_id?: string;
  user_name?: string;
  user_email?: string;
}

interface BookingsManagementProps {
  prestadorId: string;
}

const BookingsManagement = ({ prestadorId }: BookingsManagementProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('upcoming');

  const fetchBookings = async () => {
    try {
      // First, get bookings for this prestador
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          booking_date,
          duration,
          session_type,
          status,
          notes,
          prestador_notes,
          session_usage_id
        `)
        .eq('prestador_id', prestadorId)
        .order('booking_date', { ascending: false })
        .limit(50);

      if (bookingsError) {
        throw bookingsError;
      }

      // Get unique user IDs
      const userIds = [...new Set(bookingsData?.map(b => b.user_id) || [])];
      
      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Combine bookings with user data
      const formattedBookings = bookingsData?.map(booking => {
        const userProfile = profilesMap.get(booking.user_id);
        return {
          ...booking,
          user_name: userProfile?.name || 'Nome não disponível',
          user_email: userProfile?.email || 'Email não disponível'
        };
      }) || [];

      setBookings(formattedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Tente recarregar a página.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prestadorId) {
      fetchBookings();
    }
  }, [prestadorId]);

  const getFilteredBookings = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => 
          ['scheduled', 'confirmed'].includes(b.status) && 
          new Date(b.booking_date) >= now
        );
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'pending':
        return bookings.filter(b => 
          ['scheduled', 'confirmed'].includes(b.status) && 
          new Date(b.booking_date) < now
        );
      default:
        return bookings;
    }
  };

  const getFilterCounts = () => {
    const now = new Date();
    return {
      upcoming: bookings.filter(b => 
        ['scheduled', 'confirmed'].includes(b.status) && 
        new Date(b.booking_date) >= now
      ).length,
      completed: bookings.filter(b => b.status === 'completed').length,
      pending: bookings.filter(b => 
        ['scheduled', 'confirmed'].includes(b.status) && 
        new Date(b.booking_date) < now
      ).length
    };
  };

  const filteredBookings = getFilteredBookings();
  const counts = getFilterCounts();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue mx-auto mb-4"></div>
          <p>A carregar agendamentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestão de Sessões
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gerencie as suas sessões agendadas e marque-as como concluídas para deduzir automaticamente as sessões dos utilizadores.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Próximas ({counts.upcoming})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Pendentes ({counts.pending})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Concluídas ({counts.completed})
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Todas ({bookings.length})
            </Button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma sessão encontrada
              </h3>
              <p className="text-gray-600">
                {filter === 'upcoming' && "Não há sessões agendadas para o futuro."}
                {filter === 'completed' && "Ainda não concluiu nenhuma sessão."}
                {filter === 'pending' && "Não há sessões pendentes de conclusão."}
                {filter === 'all' && "Ainda não tem sessões agendadas."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <SessionManagement
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={fetchBookings}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionDeductionGuide />
    </div>
  );
};

export default BookingsManagement;