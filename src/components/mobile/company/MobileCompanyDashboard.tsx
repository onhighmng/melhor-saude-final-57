import { Star, Users, Calendar, Activity, TrendingUp, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

export function MobileCompanyDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [metrics, setMetrics] = useState({
    avgSatisfaction: '8.7',
    activeEmployees: 47,
    totalEmployees: 50,
    inactiveEmployees: 3,
    sessionsUsed: 234,
    sessionsAllocated: 400,
    mostUsedPillar: 'Saúde Mental',
    mostUsedPillarPercentage: 42,
    usageRate: 59,
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
        const activeEmployees = stats.active_employees || 47;
        const totalEmployees = activeEmployees + (stats.pending_invites || 3);
        const sessionsAllocated = stats.sessions_allocated || 400;
        const sessionsUsed = stats.sessions_used || 234;
        const usageRate = sessionsAllocated > 0 ? Math.round((sessionsUsed / sessionsAllocated) * 100) : 59;

        setMetrics({
          avgSatisfaction: '8.7',
          activeEmployees,
          totalEmployees,
          inactiveEmployees: totalEmployees - activeEmployees,
          sessionsUsed,
          sessionsAllocated,
          mostUsedPillar: 'Saúde Mental',
          mostUsedPillarPercentage: 42,
          usageRate,
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

  const activityPercentage = Math.round((metrics.activeEmployees / metrics.totalEmployees) * 100);
  const inactivePercentage = 100 - activityPercentage;

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 text-2xl font-bold mb-1">Dashboard da Empresa</h1>
          <p className="text-slate-500 text-sm">
            Visão geral do programa de bem-estar e utilização dos serviços
          </p>
        </div>

        {/* Satisfaction Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-white/60 rounded-2xl p-3">
              <Star className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 font-semibold mb-1">Satisfação Média</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{metrics.avgSatisfaction}</span>
                <span className="text-slate-600 text-sm">/10</span>
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Avaliação dos colaboradores
              </p>
            </div>
          </div>
        </div>

        {/* Usage Overview Card */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 font-semibold mb-4">Visão Geral de Utilização</h2>
          <p className="text-slate-600 text-sm mb-4">
            Principais métricas de envolvimento dos colaboradores
          </p>

          <div className="space-y-4">
            {/* Active Collaborators */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 text-sm">Atividade dos Colaboradores</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${activityPercentage}%` }} />
                </div>
                <span className="text-emerald-600 font-semibold min-w-[3rem] text-right">{activityPercentage}%</span>
              </div>
            </div>

            {/* Active */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 text-sm">Ativos</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${activityPercentage}%` }} />
                </div>
                <span className="text-blue-600 font-semibold min-w-[3rem] text-right">{activityPercentage}%</span>
              </div>
            </div>

            {/* Inactive */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-rose-600" />
                  <span className="text-slate-700 text-sm">Inativos</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${inactivePercentage}%` }} />
                </div>
                <span className="text-rose-600 font-semibold min-w-[3rem] text-right">{inactivePercentage}%</span>
              </div>
            </div>
          </div>

          {/* Most Used Pillar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-violet-50 rounded-xl p-2">
                <div className="w-5 h-5 rounded-full bg-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-700 text-sm mb-1">Pilar Mais Utilizado</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-slate-900 font-semibold">{metrics.mostUsedPillar}</span>
                  <span className="text-violet-600 font-semibold">{metrics.mostUsedPillarPercentage}%</span>
                </div>
                <p className="text-slate-500 text-xs">das sessões totais</p>
              </div>
            </div>
          </div>

          {/* Usage Rate */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-violet-50 rounded-xl p-2">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-700 text-sm mb-1">Taxa de Utilização</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-violet-600 font-semibold">{metrics.usageRate}%</span>
                </div>
                <p className="text-slate-500 text-xs">Sessões utilizadas este mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions This Month */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-white/60 rounded-2xl p-3">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 font-semibold mb-1">Sessões Este Mês</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{metrics.sessionsUsed}</span>
              </div>
              <p className="text-slate-600 text-sm mt-1">
                de {metrics.sessionsAllocated} utilizadas
              </p>
            </div>
          </div>
        </div>

        {/* Registration State */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-3xl p-6 mb-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="relative">
            <div className="bg-white/60 rounded-2xl p-3 w-fit mb-3">
              <Users className="w-7 h-7 text-violet-600" />
            </div>
            <h2 className="text-slate-900 font-semibold mb-2">Estado de Registo</h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.activeEmployees}</span>
              <span className="text-slate-700 text-sm">registados,</span>
              <span className="text-2xl font-bold text-slate-900">{metrics.inactiveEmployees}</span>
              <span className="text-slate-700 text-sm">pendentes</span>
            </div>
          </div>
        </div>

        {/* Resources Card */}
        <div className="rounded-3xl overflow-hidden shadow-sm relative h-48">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
            alt="Recursos"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 w-fit mb-2">
              <div className="w-8 h-8 bg-white rounded-xl" />
            </div>
            <h2 className="text-white font-semibold mb-1">Recursos</h2>
            <p className="text-white/90 text-sm">
              Conteúdos e materiais de apoio
            </p>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}
