import { Building2, Users, Calendar, Activity, TrendingUp, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Card } from '@/components/ui/card';

export function MobileAdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: analytics } = useAnalytics();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold mb-1">Dashboard Geral</h1>
          <p className="text-gray-500 text-sm">
            Visão geral da plataforma Melhor Saúde
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-4">
        {/* Platform Stats */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 shadow-sm border-none">
          <div className="text-center mb-6">
            <h2 className="text-gray-900 font-semibold mb-4">Atividade da Plataforma</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <Activity className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics?.total_sessions || 0}</p>
                <p className="text-gray-600 text-sm">Sessões</p>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics?.growth_rate || '0'}%</p>
                <p className="text-gray-600 text-sm">Crescimento</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/admin/users-management?tab=companies')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Empresas</h3>
              <p className="text-2xl font-bold text-blue-600">{analytics?.total_companies || 0}</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/admin/users-management?tab=employees')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Utilizadores</h3>
              <p className="text-2xl font-bold text-yellow-600">{analytics?.total_users || 0}</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/admin/operations')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Operações</h3>
              <p className="text-gray-600 text-xs">Sessões</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/admin/settings')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Definições</h3>
              <p className="text-gray-600 text-xs">Configurar</p>
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm text-center">
            Use os cartões acima para aceder rapidamente às diferentes secções da plataforma
          </p>
        </Card>
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}

