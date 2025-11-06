import { Star, Users, Calendar, Activity, BookOpen, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export function MobileCompanyDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [metrics, setMetrics] = useState({
    avgSatisfaction: '0',
    activeEmployees: 0,
    totalEmployees: 0,
    sessionsUsed: 0,
    sessionsAllocated: 0,
    mostUsedPillar: 'Saúde Mental',
    mostUsedPillarPercentage: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: seatStats } = await supabase
          .rpc('get_company_seat_stats' as any, { p_company_id: profile.company_id })
          .single();

        const stats = seatStats as any;
        const activeEmployees = stats.active_employees || 0;
        const totalEmployees = activeEmployees + (stats.pending_invites || 0);
        const sessionsAllocated = stats.sessions_allocated || 0;
        const sessionsUsed = stats.sessions_used || 0;

        setMetrics({
          avgSatisfaction: '8.7',
          activeEmployees,
          totalEmployees,
          sessionsUsed,
          sessionsAllocated,
          mostUsedPillar: 'Saúde Mental',
          mostUsedPillarPercentage: 45,
        });
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [profile?.company_id]);

  if (loading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar painel..." showProgress={true} />;
  }

  const usagePercentage = metrics.sessionsAllocated > 0 
    ? Math.round((metrics.sessionsUsed / metrics.sessionsAllocated) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold mb-1">Dashboard da Empresa</h1>
          <p className="text-gray-500 text-sm">
            Visão geral do programa de bem-estar
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Satisfaction Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 shadow-sm border-none">
          <div className="flex items-start gap-3">
            <div className="bg-white/60 rounded-2xl p-3">
              <Star className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 font-semibold mb-1">Satisfação Média</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{metrics.avgSatisfaction}</span>
                <span className="text-gray-600 text-sm">/10</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Avaliação dos colaboradores
              </p>
            </div>
          </div>
        </Card>

        {/* Usage Overview Card */}
        <Card className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 font-semibold mb-4">Visão Geral de Utilização</h2>
          <p className="text-gray-600 text-sm mb-4">
            Principais métricas de envolvimento dos colaboradores
          </p>

          <div className="space-y-4">
            {/* Active Collaborators */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700 text-sm">Colaboradores Ativos</span>
                </div>
                <span className="text-gray-900 font-semibold">{metrics.activeEmployees}/{metrics.totalEmployees}</span>
              </div>
              <Progress 
                value={(metrics.activeEmployees / (metrics.totalEmployees || 1)) * 100} 
                className="h-2" 
              />
            </div>

            {/* Sessions Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 text-sm">Utilização de Sessões</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {metrics.sessionsUsed}/{metrics.sessionsAllocated}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>

            {/* Most Used Service */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700 text-sm">Serviço Mais Utilizado</span>
                </div>
                <span className="text-gray-900 font-semibold">{metrics.mostUsedPillar}</span>
              </div>
              <Progress value={metrics.mostUsedPillarPercentage} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/company/sessions')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Sessões</h3>
              <p className="text-gray-600 text-xs">Ver todas</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/company/colaboradores')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Equipa</h3>
              <p className="text-gray-600 text-xs">{metrics.totalEmployees} membros</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/company/relatorios')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Relatórios</h3>
              <p className="text-gray-600 text-xs">Ver impacto</p>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 shadow-sm border-none cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/company/recursos')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Recursos</h3>
              <p className="text-gray-600 text-xs">Explorar</p>
            </div>
          </Card>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}

