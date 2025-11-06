import { useState, useEffect } from 'react';
import { Phone, User, Clock, Video, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface CallRequest {
  id: string;
  user_name: string;
  company: string;
  pillar: string;
  time_ago: string;
  status: 'pending' | 'accepted' | 'completed';
}

export function MobileSpecialistCalls() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const { escalatedChats, loading: chatsLoading } = useEscalatedChats();
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    totalTime: '0h'
  });

  useEffect(() => {
    fetchStats();
  }, [profile?.id]);

  const fetchStats = async () => {
    try {
      if (!profile?.id) return;

      const { data: prestador } = await supabase
        .from('prestadores')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!prestador) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('duration')
        .eq('prestador_id', prestador.id)
        .gte('scheduled_for', today)
        .eq('status', 'completed');

      const totalMinutes = (todayBookings || []).reduce((sum: number, b: any) => sum + (b.duration || 60), 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setStats({
        pending: escalatedChats.filter(c => c.status === 'phone_escalated').length,
        today: (todayBookings || []).length,
        totalTime: minutes > 0 ? `${hours}.${Math.round(minutes / 6)}h` : `${hours}h`
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const callRequests: CallRequest[] = escalatedChats
    .filter(chat => chat.status === 'phone_escalated')
    .map(chat => ({
      id: chat.id,
      user_name: chat.user_name || 'Utilizador',
      company: chat.company_name || 'Empresa',
      pillar: chat.pillar || 'Geral',
      time_ago: getTimeAgo(chat.escalated_at),
      status: 'pending'
    }));

  function getTimeAgo(date: string | Date | null): string {
    if (!date) return 'recente';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} mins`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${Math.floor(diffHours / 24)} dias`;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Pedidos de Chamada</h1>
          <p className="text-gray-500 text-sm">Gerir solicitações de chamadas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-orange-50 rounded-2xl p-4 border-none text-center">
            <Phone className="w-5 h-5 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-xs text-gray-600">Pendentes</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none text-center">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.today}</p>
            <p className="text-xs text-gray-600">Hoje</p>
          </Card>
          <Card className="bg-blue-50 rounded-2xl p-4 border-none text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.totalTime}</p>
            <p className="text-xs text-gray-600">Tempo Total</p>
          </Card>
        </div>

        {/* Loading State */}
        {chatsLoading && (
          <LoadingAnimation 
            variant="inline" 
            message="A carregar pedidos..." 
            showProgress={false}
          />
        )}

        {/* Call Requests List */}
        {!chatsLoading && (
          <div className="space-y-3">
            {callRequests.map((request) => (
            <Card 
              key={request.id}
              className="bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{request.user_name}</h3>
                  <p className="text-gray-500 text-sm">{request.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs">{request.pillar}</Badge>
                    <span className="text-xs text-gray-500">{request.time_ago}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Aceitar
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Online
                </Button>
              </div>
            </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!chatsLoading && callRequests.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum pedido de chamada pendente</p>
          </div>
        )}
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

