import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MeetingInfoCard } from '@/components/ui/meeting-info-card';
import { mockSessions } from '@/data/sessionMockData';

interface Appointment {
  id: string;
  type: string;
  professional: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'pending' | 'cancelled';
  hasVideoLink?: boolean;
  meeting_link?: string;
}

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          status,
          duration,
          meeting_link,
          session_type,
          prestadores!inner(name),
          pillar_specialties(specialty_name)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;

      const formattedAppointments = (data || []).map(booking => {
        const bookingDate = new Date(booking.booking_date);
        return {
          id: booking.id,
          type: booking.pillar_specialties?.specialty_name || booking.session_type || 'Individual',
          professional: booking.prestadores?.name || 'TBD',
          date: bookingDate.toLocaleDateString('pt-PT'),
          time: bookingDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          location: booking.meeting_link ? 'Online' : 'Presencial',
          status: booking.status as 'scheduled' | 'completed' | 'pending' | 'cancelled',
          hasVideoLink: !!booking.meeting_link,
          meeting_link: booking.meeting_link
        };
      });

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as consultas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-vibrant-blue text-white';
      case 'completed':
        return 'bg-emerald-green text-white';
      case 'pending':
        return 'bg-warm-yellow text-navy-blue';
      case 'cancelled':
        return 'bg-soft-coral text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleJoinVideo = (appointment: Appointment) => {
    if (appointment.meeting_link) {
      window.open(appointment.meeting_link, '_blank');
    } else {
      toast({
        title: "Link não disponível",
        description: "O link da videochamada ainda não foi disponibilizado.",
        variant: "destructive"
      });
    }
  };

  const handleReschedule = (appointmentId: string) => {
    toast({
      title: "Reagendamento solicitado",
      description: "Em breve entraremos em contacto para reagendar a sua consulta.",
    });
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      const { error } = await supabase.functions.invoke('booking-update-status', {
        body: { 
          bookingId: appointmentId, 
          status: 'cancelled',
          cancellation_reason: 'Cancelled by patient'
        }
      });

      if (error) throw error;

      toast({
        title: "Consulta cancelada",
        description: "A sua consulta foi cancelada com sucesso.",
      });

      // Refresh appointments
      await fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a consulta.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="text-center text-navy-blue/70">
            Carregando consultas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="text-center text-navy-blue/70">
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma consulta agendada
            </h3>
            <p>
              Clique em "Nova Sessão" para agendar a sua primeira consulta.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show mock session data with meeting info for demonstration */}
      {mockSessions.slice(0, 3).map((session) => (
        <div key={session.id} className="space-y-3">
          <Card className="glass-effect">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-navy-blue text-lg">
                    Sessão Individual - {session.prestadorName}
                  </CardTitle>
                  <p className="text-navy-blue/70 mt-1">
                    {session.pillar === 'saude_mental' ? 'Saúde Mental' : 
                     session.pillar === 'bem_estar_fisico' ? 'Bem-Estar Físico' :
                     session.pillar === 'assistencia_financeira' ? 'Assistência Financeira' :
                     'Assistência Jurídica'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-navy-blue/70 mb-4">
                <div>
                  <span className="font-medium">Data:</span> {new Date(session.date).toLocaleDateString('pt-PT')}
                </div>
                <div>
                  <span className="font-medium">Hora:</span> {session.time}
                </div>
                <div>
                  <span className="font-medium">Local:</span> Online
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <Badge className={
                  session.status === 'scheduled' ? 'bg-vibrant-blue text-white' :
                  session.status === 'completed' ? 'bg-emerald-green text-white' :
                  session.status === 'cancelled' ? 'bg-soft-coral text-white' :
                  'bg-gray-500 text-white'
                }>
                  {session.status === 'scheduled' ? 'Agendada' :
                   session.status === 'completed' ? 'Concluída' :
                   session.status === 'cancelled' ? 'Cancelada' :
                   session.status}
                </Badge>
              </div>

              {/* Meeting Info Card */}
              <MeetingInfoCard session={session} userRole="user" />
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Regular appointments list */}
      {appointments.map((appointment) => (
        <Card 
          key={appointment.id}
          className="glass-effect"
        >
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-navy-blue text-lg">
                  {appointment.type}
                </CardTitle>
                <p className="text-navy-blue/70 mt-1">
                  {appointment.professional}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-navy-blue/70">
              <div>
                <span className="font-medium">Data:</span> {appointment.date}
              </div>
              <div>
                <span className="font-medium">Hora:</span> {appointment.time}
              </div>
              <div>
                <span className="font-medium">Local:</span> {appointment.location}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>

              <div className="flex gap-2">
                {appointment.status === 'scheduled' && appointment.hasVideoLink && (
                  <Button
                    size="sm"
                    onClick={() => handleJoinVideo(appointment)}
                    className="bg-vibrant-blue hover:bg-vibrant-blue/90 text-white"
                  >
                    Entrar na Sessão
                  </Button>
                )}
                
                {appointment.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReschedule(appointment.id)}
                      className="border-accent-sage/20"
                    >
                      Reagendar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(appointment.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  </>
                )}

                {appointment.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-accent-sage/20"
                  >
                    Ver Relatório
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsList;