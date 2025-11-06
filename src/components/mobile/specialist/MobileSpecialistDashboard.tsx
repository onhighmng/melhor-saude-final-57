import { Phone, Calendar, TrendingUp, User, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { useSpecialistAnalytics } from '@/hooks/useSpecialistAnalytics';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function MobileSpecialistDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { escalatedChats } = useEscalatedChats();
  const { metrics } = useSpecialistAnalytics();
  
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const callRequests = escalatedChats.filter(chat => chat.status === 'phone_escalated').slice(0, 3);

  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('bookings')
          .select('*, profiles!bookings_user_id_fkey(name)')
          .eq('prestador_id', prestador.id)
          .eq('date', today)
          .order('start_time', { ascending: true })
          .limit(3);

        setTodaySessions(data || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold mb-1">
            Bem-vindo, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm">
            Gerir clientes e sessões
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-4">
        {/* Call Requests Card */}
        {callRequests.length > 0 && (
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 shadow-sm border-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-gray-900 font-semibold">Pedidos de Chamada</h2>
                <p className="text-gray-600 text-sm">{callRequests.length} pendentes</p>
              </div>
              <Badge className="bg-red-500 text-white">{callRequests.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {callRequests.map((request: any, idx: number) => (
                <div 
                  key={idx}
                  className="bg-white/70 rounded-2xl p-4 cursor-pointer hover:bg-white transition-colors"
                  onClick={() => navigate('/especialista/call-requests')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">{request.user_name || 'Cliente'}</p>
                      <p className="text-gray-500 text-sm">{request.company_name || 'Empresa'}</p>
                    </div>
                    <Phone className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Today's Sessions */}
        <Card className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900 font-semibold">Sessões de Hoje</h2>
              <p className="text-gray-600 text-sm">{todaySessions.length} agendadas</p>
            </div>
          </div>

          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session: any) => (
                <div 
                  key={session.id}
                  className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/especialista/calendar')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">
                        {session.profiles?.name || 'Cliente'}
                      </p>
                      <p className="text-gray-500 text-sm">{session.start_time}</p>
                    </div>
                    <Badge>{session.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Sem sessões agendadas</p>
          )}
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/especialista/clients')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Clientes</h3>
              <p className="text-2xl font-bold text-purple-600">{metrics?.totalClients || 0}</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/especialista/stats')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Estatísticas</h3>
              <p className="text-2xl font-bold text-green-600">{metrics?.completedSessions || 0}</p>
            </div>
          </Card>
        </div>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

