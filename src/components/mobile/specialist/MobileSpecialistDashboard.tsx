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
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

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
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar painel..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-center">Dashboard</h1>
          <p className="text-center text-gray-500 text-sm mt-1">
            Profissional de Permanência
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Pending Calls Card */}
        <div 
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-sm cursor-pointer active:scale-95 transition-transform"
          onClick={() => navigate('/especialista/call-requests')}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>Chamadas Pendentes</h2>
              <p className="text-sm text-gray-600">{callRequests.length} chamadas aguardam ligação</p>
            </div>
          </div>
        </div>

        {/* Today's Sessions Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>Sessões Hoje</h2>
              <p className="text-sm text-gray-600">{todaySessions.length} sessões agendadas para hoje</p>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" 
            alt="Sessions" 
            className="w-full h-32 object-cover rounded-xl"
          />
        </div>

        {/* General Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h2>Visão Geral</h2>
            <p className="text-sm text-gray-600">Atividade recente e métricas principais</p>
          </div>

          {/* Call Requests Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-red-500" />
              <h3 className="text-sm">Pedidos de Chamada</h3>
            </div>
            {callRequests.slice(0, 3).map((request: any, index: number) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm">{request.user_name || 'Cliente'}</p>
                    <p className="text-xs text-gray-600">{request.company_name || 'Empresa'}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">há {index * 5 + 5} mins</span>
              </div>
            ))}
            <button 
              className="w-full text-sm text-purple-600 mt-3" 
              onClick={() => navigate('/especialista/stats')}
            >
              Ver Estatísticas Completas →
            </button>
          </div>

          {/* Scheduled Sessions Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm">Sessões Agendadas</h3>
            </div>
            {todaySessions.slice(0, 3).map((session: any, index: number) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm">{session.profiles?.name || 'Cliente'}</p>
                    <p className="text-xs text-gray-600">{session.start_time} - Individual</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Performance */}
        <div 
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm cursor-pointer active:scale-95 transition-transform"
          onClick={() => navigate('/especialista/stats')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>Desempenho Pessoal</h2>
              <p className="text-sm text-gray-600">{metrics?.completedSessions || 0} casos este mês</p>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

