import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Star, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export function MobileSpecialistStats() {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeClients: 0,
    averageRating: 0,
    totalHours: 0,
    completionRate: 0,
    responseTime: '0h'
  });

  useEffect(() => {
    const calculateStats = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get prestador ID for this specialist
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setLoading(false);
          return;
        }

        // Fetch bookings for stats calculation
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, user_id, status, rating, booking_date, start_time, end_time')
          .eq('prestador_id', prestador.id)
          .gte('booking_date', startOfMonth.toISOString().split('T')[0]);

        if (bookingsError) throw bookingsError;

        // Fetch call logs for response time
        const { data: callLogs, error: callLogsError } = await supabase
          .from('specialist_call_logs')
          .select('created_at, completed_at')
          .eq('specialist_id', profile.id)
          .not('completed_at', 'is', null)
          .gte('created_at', startOfMonth.toISOString());

        if (callLogsError) throw callLogsError;

        // Calculate total sessions
        const totalSessions = bookings?.length || 0;

        // Calculate active clients (distinct user_ids)
        const uniqueUserIds = new Set(bookings?.map(b => b.user_id) || []);
        const activeClients = uniqueUserIds.size;

        // Calculate average rating
        const ratingsOnly = bookings?.filter(b => b.rating && b.rating > 0).map(b => b.rating) || [];
        const averageRating = ratingsOnly.length > 0 
          ? (ratingsOnly.reduce((sum, r) => sum + r, 0) / ratingsOnly.length)
          : 0;

        // Calculate total hours (assuming 1 hour per session for simplicity)
        const totalHours = bookings?.filter(b => b.status === 'completed').length || 0;

        // Calculate completion rate
        const completedCount = bookings?.filter(b => b.status === 'completed').length || 0;
        const completionRate = totalSessions > 0 
          ? Math.round((completedCount / totalSessions) * 100) 
          : 0;

        // Calculate average response time
        let avgResponseTime = 0;
        if (callLogs && callLogs.length > 0) {
          const totalResponseTime = callLogs.reduce((sum, log) => {
            const diff = new Date(log.completed_at).getTime() - new Date(log.created_at).getTime();
            return sum + diff;
          }, 0);
          avgResponseTime = totalResponseTime / callLogs.length / (1000 * 60 * 60); // Convert to hours
        }
        const responseTime = avgResponseTime > 0 
          ? `${avgResponseTime.toFixed(1)}h` 
          : '0h';

        setStats({
          totalSessions,
          activeClients,
          averageRating: Math.round(averageRating * 10) / 10,
          totalHours,
          completionRate,
          responseTime
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [profile?.id, selectedPeriod]);

  if (loading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar estatísticas..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Estatísticas</h1>
          <p className="text-gray-500 text-sm">Desempenho e métricas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'year' && 'Ano'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none">
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
            <p className="text-xs text-gray-600">Sessões</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none">
            <Users className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.activeClients}</p>
            <p className="text-xs text-gray-600">Clientes Ativos</p>
          </Card>
          <Card className="bg-yellow-50 rounded-2xl p-4 border-none">
            <Star className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
            <p className="text-xs text-gray-600">Avaliação Média</p>
          </Card>
          <Card className="bg-purple-50 rounded-2xl p-4 border-none">
            <Clock className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{stats.totalHours}h</p>
            <p className="text-xs text-gray-600">Horas Totais</p>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-white rounded-2xl p-5 border border-gray-200 mb-3">
          <h3 className="text-gray-900 font-semibold mb-4">Desempenho</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                <span className="text-sm font-medium text-gray-900">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Tempo Médio de Resposta</span>
                <span className="text-sm font-medium text-gray-900">{stats.responseTime}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

