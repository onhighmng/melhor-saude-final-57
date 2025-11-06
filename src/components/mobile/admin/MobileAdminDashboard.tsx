import { Building2, Users, Calendar, BookOpen, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileAdminDashboard() {
  const navigate = useNavigate();
  const { data: analytics } = useAnalytics();

  const stats = {
    activeCompanies: analytics?.total_companies || 0,
    usageRate: 78,
    activeProviders: 24,
    avgSatisfaction: 4.6,
    registeredEmployees: analytics?.total_users || 0,
    totalSessions: analytics?.total_sessions || 0
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl font-bold mb-1">Dashboard Geral</h1>
        <p className="text-sm text-gray-500">Visão geral da plataforma Melhor Saúde</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empresas Ativas */}
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Empresas Ativas</h3>
          <p className="text-sm text-gray-600">{stats.activeCompanies} empresas ativas</p>
        </div>

        {/* Atividade da Plataforma */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 md:col-span-2 lg:col-span-1 lg:row-span-2">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 font-semibold mb-6">Atividade da Plataforma</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Utilização</span>
                <span className="text-purple-600 font-semibold">{stats.usageRate}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${stats.usageRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Prestadores Ativos</span>
                <span className="text-purple-600 font-semibold">{stats.activeProviders}</span>
              </div>
              <p className="text-xs text-gray-500">A fornecer serviços</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Satisfação Média</span>
                <span className="text-purple-600 font-semibold">{stats.avgSatisfaction}/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Colaboradores Registados */}
        <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Colaboradores Registados</h3>
          <p className="text-sm text-gray-600">{stats.registeredEmployees} colaboradores</p>
        </div>

        {/* Sessões Agendadas */}
        <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Sessões Agendadas</h3>
          <p className="text-sm text-gray-600">{stats.totalSessions} sessões</p>
        </div>

        {/* Recursos Disponíveis */}
        <div 
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-100 cursor-pointer active:scale-95 transition-transform"
          onClick={() => navigate('/admin/recursos')}
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">Recursos Disponíveis</h3>
          <p className="text-sm text-gray-600">Biblioteca de conteúdos</p>
        </div>
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}
