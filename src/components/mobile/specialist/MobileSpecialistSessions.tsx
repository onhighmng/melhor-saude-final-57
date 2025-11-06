import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface Session {
  id: string;
  user_name: string;
  date: string;
  time: string;
  type: 'online' | 'phone' | 'in-person';
  pillar: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export function MobileSpecialistSessions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get prestador ID for this specialist
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setSessions([]);
          setLoading(false);
          return;
        }

        // Fetch bookings with user and company information
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            start_time,
            meeting_type,
            pillar,
            status,
            profiles!bookings_user_id_fkey(name),
            companies(name)
          `)
          .eq('prestador_id', prestador.id)
          .order('booking_date', { ascending: false });

        if (error) throw error;

        // Map bookings to Session interface
        const mappedSessions: Session[] = (bookings || []).map((booking: any) => {
          // Map pillar to Portuguese labels
          let pillarLabel = 'Saúde Mental';
          if (booking.pillar === 'bem_estar_fisico' || booking.pillar === 'physical') {
            pillarLabel = 'Bem-Estar Físico';
          } else if (booking.pillar === 'assistencia_financeira' || booking.pillar === 'financial') {
            pillarLabel = 'Assistência Financeira';
          } else if (booking.pillar === 'assistencia_juridica' || booking.pillar === 'legal') {
            pillarLabel = 'Assistência Jurídica';
          }

          // Map meeting type
          let type: 'online' | 'phone' | 'in-person' = 'online';
          if (booking.meeting_type === 'phone') type = 'phone';
          else if (booking.meeting_type === 'in-person') type = 'in-person';

          // Map status
          let sessionStatus: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
          if (booking.status === 'completed') sessionStatus = 'completed';
          else if (booking.status === 'cancelled') sessionStatus = 'cancelled';

          return {
            id: booking.id,
            user_name: booking.profiles?.name || 'Utilizador',
            date: booking.booking_date,
            time: booking.start_time || '00:00',
            type,
            pillar: pillarLabel,
            status: sessionStatus
          };
        });

        setSessions(mappedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [profile?.id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return Video;
      case 'phone': return Phone;
      case 'in-person': return MapPin;
      default: return Video;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

  if (loading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar sessões..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Sessões</h1>
          <p className="text-gray-500 text-sm">Gerir as suas sessões</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="upcoming" className="flex-1">
              Próximas ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Concluídas ({completedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-0">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma sessão agendada</p>
              </div>
            ) : (
              upcomingSessions.map((session) => {
                const TypeIcon = getTypeIcon(session.type);
                return (
                  <Card 
                    key={session.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer"
                    onClick={() => navigate(`/especialista/sessions/${session.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-medium">{session.user_name}</h3>
                        <p className="text-gray-500 text-sm">{session.pillar}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">{new Date(session.date).toLocaleDateString('pt-PT')}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">{session.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <TypeIcon className="w-4 h-4" />
                            <span className="text-xs capitalize">{session.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedSessions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma sessão concluída</p>
              </div>
            ) : (
              completedSessions.map((session) => {
                const TypeIcon = getTypeIcon(session.type);
                return (
                  <Card 
                    key={session.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 opacity-75"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-medium">{session.user_name}</h3>
                        <p className="text-gray-500 text-sm">{session.pillar}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">{new Date(session.date).toLocaleDateString('pt-PT')}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">{session.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

