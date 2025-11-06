import { useState, useEffect } from 'react';
import { Activity, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  time: string;
  status: 'success' | 'info' | 'warning';
}

export function MobileAdminOperations() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeSessions: 0,
    scheduledToday: 0,
    pendingApprovals: 0,
    systemHealth: 'good'
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch active sessions (in_progress status)
        const { count: activeCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'in_progress');

        // Fetch today's scheduled sessions
        const { count: todayCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('booking_date', today);

        // Fetch pending specialist approvals
        const { count: pendingCount } = await supabase
          .from('prestadores')
          .select('id', { count: 'exact', head: true })
          .eq('approval_status', 'pending');

        // Fetch recent activity (latest bookings)
        const { data: recentBookings } = await supabase
          .from('bookings')
          .select('id, status, created_at, profiles!bookings_user_id_fkey(name)')
          .order('created_at', { ascending: false })
          .limit(10);

        // Map bookings to activity items
        const activities: ActivityItem[] = (recentBookings || []).map((booking: any) => {
          const timeDiff = Date.now() - new Date(booking.created_at).getTime();
          const minutes = Math.floor(timeDiff / 60000);
          const timeStr = minutes < 60 ? `há ${minutes} mins` : `há ${Math.floor(minutes / 60)}h`;

          let activityType = 'booking_created';
          let activityStatus: 'success' | 'info' | 'warning' = 'info';
          let description = `Nova reserva - ${booking.profiles?.name || 'Utilizador'}`;

          if (booking.status === 'completed') {
            activityType = 'session_completed';
            activityStatus = 'success';
            description = `Sessão concluída - ${booking.profiles?.name || 'Utilizador'}`;
          } else if (booking.status === 'cancelled') {
            activityType = 'session_cancelled';
            activityStatus = 'warning';
            description = `Sessão cancelada - ${booking.profiles?.name || 'Utilizador'}`;
          }

          return {
            id: booking.id,
            type: activityType,
            description,
            time: timeStr,
            status: activityStatus
          };
        });

        setStats({
          activeSessions: activeCount || 0,
          scheduledToday: todayCount || 0,
          pendingApprovals: pendingCount || 0,
          systemHealth: 'good' // Default for now
        });

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error loading admin operations data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar operações..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Operações</h1>
          <p className="text-gray-500 text-sm">Monitorização da plataforma</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none">
            <Activity className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.activeSessions}</p>
            <p className="text-xs text-gray-600">Sessões Ativas</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none">
            <Calendar className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.scheduledToday}</p>
            <p className="text-xs text-gray-600">Agendadas Hoje</p>
          </Card>
          <Card className="bg-yellow-50 rounded-2xl p-4 border-none">
            <AlertCircle className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
            <p className="text-xs text-gray-600">Aprovações</p>
          </Card>
          <Card className="bg-purple-50 rounded-2xl p-4 border-none">
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">98%</p>
            <p className="text-xs text-gray-600">Uptime</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Atividade Recente</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}

