import { useState, useEffect } from 'react';
import { FileText, Users, Calendar, Star, TrendingUp, ChevronDown } from 'lucide-react';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

export function MobileCompanyReports() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeEmployees: 1,
    completedSessions: 0,
    avgSatisfaction: '0',
    usageRate: 0,
    mostUsedPillar: 'N/A',
    satisfactionRate: 0
  });

  useEffect(() => {
    const loadMetrics = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: seatStats } = await supabase
          .rpc('get_company_seat_stats' as any, { p_company_id: profile.company_id })
          .single();

        const stats = seatStats as any;
        
        // Fetch bookings for additional metrics
        const { data: bookings } = await supabase
          .from('bookings')
          .select('status, rating, pillar')
          .eq('company_id', profile.company_id);

        const completedCount = (bookings || []).filter((b: any) => b.status === 'completed').length;
        const ratingsOnly = (bookings || []).filter((b: any) => b.rating && b.rating > 0);
        const avgRating = ratingsOnly.length > 0 
          ? (ratingsOnly.reduce((sum: number, b: any) => sum + b.rating, 0) / ratingsOnly.length).toFixed(1)
          : '0';

        // Calculate most used pillar
        const pillarCounts: Record<string, number> = {};
        (bookings || []).forEach((b: any) => {
          const pillar = b.pillar || 'saude_mental';
          pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
        });
        const mostUsed = Object.entries(pillarCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['N/A', 0])[0];
        const pillarLabels: Record<string, string> = {
          'saude_mental': 'Saúde Mental',
          'bem_estar_fisico': 'Bem-Estar Físico',
          'assistencia_financeira': 'Assistência Financeira',
          'assistencia_juridica': 'Assistência Jurídica'
        };

        const usageRate = stats.sessions_allocated > 0 
          ? Math.round((stats.sessions_used / stats.sessions_allocated) * 100)
          : 0;

        setMetrics({
          activeEmployees: stats.active_employees || 1,
          completedSessions: completedCount,
          avgSatisfaction: avgRating,
          usageRate,
          mostUsedPillar: pillarLabels[mostUsed] || 'N/A',
          satisfactionRate: ratingsOnly.length > 0 
            ? Math.round((ratingsOnly.filter((b: any) => b.rating >= 7).length / ratingsOnly.length) * 100)
            : 0
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [profile?.company_id]);

  const handleExportReport = () => {
    console.log('Export monthly report');
    // TODO: Implement report export
  };

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar relatórios..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 text-2xl font-bold mb-2 text-center">Relatórios e Impacto</h1>
          <p className="text-slate-600 text-center text-sm">
            Avalie localmente do bem-estar dos colaboradores e impacto dos programas
          </p>
        </div>

        {/* Month Selector */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-blue-900 text-sm">Plano de 3 Meses - 1 clínicas - 3 profissionais - 48 frequências</span>
        </div>

        {/* Export Report Button */}
        <div className="mb-6">
          <button 
            onClick={handleExportReport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <FileText className="w-5 h-5" />
            <span>Exportar Relatório Mensal</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Colaboradores Ativos */}
          <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 text-sm">Colaboradores Ativos</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.activeEmployees}</div>
          </div>

          {/* Sessões Realizadas */}
          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 text-sm">Sessões Realizadas</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.completedSessions}</div>
          </div>

          {/* Satisfação Média */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700 text-sm">Satisfação Média</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.avgSatisfaction}/10</div>
          </div>

          {/* Taxa de Utilização */}
          <div className="bg-violet-50 rounded-3xl p-5 border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              <span className="text-slate-700 text-sm">Taxa de Utilização</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.usageRate}%</div>
          </div>
        </div>

        {/* Distribuição por Pilar */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 font-semibold mb-4">Distribuição por Pilar</h2>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="bg-slate-50 rounded-full p-6 mb-3 inline-block">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Sem dados de distribuição</p>
              <p className="text-slate-400 text-xs mt-1">Os dados aparecerão após as primeiras sessões</p>
            </div>
          </div>
        </div>

        {/* Destaques do Período */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 rounded-xl p-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-slate-900 font-semibold">Destaques do Período</h2>
          </div>

          {/* Pilar Mais Utilizado */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 text-sm font-medium">Pilar Mais Utilizado</h3>
              <button className="text-blue-600 text-sm flex items-center gap-1">
                Ver sessões
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 mb-2">{metrics.mostUsedPillar}</div>
                {metrics.mostUsedPillar === 'N/A' && (
                  <p className="text-slate-400 text-xs">Sem dados disponíveis</p>
                )}
              </div>
            </div>
          </div>

          {/* Satisfação dos Colaboradores */}
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="text-slate-700 text-sm font-medium mb-4">Satisfação dos Colaboradores</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-500 text-xs mb-1">Avaliação Média</div>
                <div className="text-2xl font-bold text-slate-900">{metrics.avgSatisfaction}/10</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Alto Instituição</div>
                <div className="text-2xl font-bold text-slate-900">{metrics.satisfactionRate}%</div>
                <div className="text-slate-500 text-xs">{metrics.completedSessions} de {metrics.completedSessions}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}
