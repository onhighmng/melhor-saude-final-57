import { useState } from 'react';
import { Activity, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileAdminOperations() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    activeSessions: 12,
    scheduledToday: 28,
    pendingApprovals: 5,
    systemHealth: 'good'
  };

  const recentActivity = [
    {
      id: 1,
      type: 'session_completed',
      description: 'Sessão concluída - João Silva',
      time: 'há 5 mins',
      status: 'success'
    },
    {
      id: 2,
      type: 'booking_created',
      description: 'Nova reserva - Maria Santos',
      time: 'há 12 mins',
      status: 'info'
    },
    {
      id: 3,
      type: 'approval_pending',
      description: 'Novo especialista aguarda aprovação',
      time: 'há 30 mins',
      status: 'warning'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
        </Card>
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}

