import { useState, useEffect } from 'react';
import { FileText, Heart, DollarSign, Scale, Calendar } from 'lucide-react';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface PillarStats {
  name: string;
  sessions: number;
  percentage: number;
  color: string;
}

export function MobileCompanySessions() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contractedSessions, setContractedSessions] = useState(400);
  const [pillarStats, setPillarStats] = useState<PillarStats[]>([
    { name: 'Saúde Mental', sessions: 48, percentage: 94, color: 'from-blue-50 to-blue-100' },
    { name: 'Bem-Estar Físico', sessions: 46, percentage: 66, color: 'from-amber-50 to-amber-100' },
    { name: 'Assistência Financeira', sessions: 42, percentage: 43, color: 'from-emerald-50 to-emerald-100' },
    { name: 'Assistência Jurídica', sessions: 48, percentage: 82, color: 'from-violet-50 to-violet-100' },
  ]);

  useEffect(() => {
    const fetchSessionStats = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: seatStats } = await supabase
          .rpc('get_company_seat_stats' as any, { p_company_id: profile.company_id })
          .single();

        const stats = seatStats as any;
        setContractedSessions(stats.sessions_allocated || 400);

        // Fetch bookings to calculate pillar distribution
        const { data: bookings } = await supabase
          .from('bookings')
          .select('pillar')
          .eq('company_id', profile.company_id);

        const pillarCounts: Record<string, number> = {
          'saude_mental': 0,
          'bem_estar_fisico': 0,
          'assistencia_financeira': 0,
          'assistencia_juridica': 0
        };

        (bookings || []).forEach((booking: any) => {
          const pillar = booking.pillar || 'saude_mental';
          if (pillarCounts[pillar] !== undefined) {
            pillarCounts[pillar]++;
          }
        });

        const total = Object.values(pillarCounts).reduce((a, b) => a + b, 0) || 1;

        setPillarStats([
          { 
            name: 'Saúde Mental', 
            sessions: pillarCounts['saude_mental'], 
            percentage: Math.round((pillarCounts['saude_mental'] / total) * 100), 
            color: 'from-blue-50 to-blue-100'
          },
          { 
            name: 'Bem-Estar Físico', 
            sessions: pillarCounts['bem_estar_fisico'], 
            percentage: Math.round((pillarCounts['bem_estar_fisico'] / total) * 100), 
            color: 'from-amber-50 to-amber-100'
          },
          { 
            name: 'Assistência Financeira', 
            sessions: pillarCounts['assistencia_financeira'], 
            percentage: Math.round((pillarCounts['assistencia_financeira'] / total) * 100), 
            color: 'from-emerald-50 to-emerald-100'
          },
          { 
            name: 'Assistência Jurídica', 
            sessions: pillarCounts['assistencia_juridica'], 
            percentage: Math.round((pillarCounts['assistencia_juridica'] / total) * 100), 
            color: 'from-violet-50 to-violet-100'
          },
        ]);
      } catch (error) {
        console.error('Error fetching session stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStats();
  }, [profile?.company_id]);

  const handleExportReport = () => {
    console.log('Export report');
    // TODO: Implement report export
  };

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar sessões..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-slate-900 text-2xl font-bold mb-1">Sessões</h1>
          </div>
          <button 
            onClick={handleExportReport}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-2 px-4 flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>
        </div>

        {/* Sessions Dashboard Card */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-blue-50 rounded-2xl p-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 font-semibold mb-1">Sessões Contratadas</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-slate-900">{contractedSessions}</span>
              </div>
              <p className="text-slate-600 text-sm">Distribuídas no contrato</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <h3 className="text-slate-900 font-medium mb-3">Dashboard Intuitivo de Sessões</h3>
            <p className="text-slate-600 text-sm mb-4">
              Visualize métricas de utilização com gráficos elegantes que fornecem insights acionáveis em tempo real.
            </p>
          </div>
        </div>

        {/* Integrated Wellness Pillars */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h2 className="text-slate-900 font-semibold mb-2">Pilares de Bem-Estar Integrados</h2>
            <p className="text-slate-600 text-sm">
              Acesso completo a todos os pilares de saúde numa única plataforma centralizada e eficiente.
            </p>
          </div>

          <div className="space-y-3">
            {/* Mental Health */}
            <div className={`bg-gradient-to-br ${pillarStats[0].color} rounded-2xl p-4 flex items-center gap-4`}>
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm font-medium mb-0.5">{pillarStats[0].name}</h3>
                <p className="text-slate-600 text-xs">{pillarStats[0].sessions} de em sessões</p>
              </div>
              <div className="bg-blue-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-blue-600 font-semibold">{pillarStats[0].percentage}%</span>
              </div>
            </div>

            {/* Physical Wellness */}
            <div className={`bg-gradient-to-br ${pillarStats[1].color} rounded-2xl p-4 flex items-center gap-4`}>
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <Heart className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm font-medium mb-0.5">{pillarStats[1].name}</h3>
                <p className="text-slate-600 text-xs">{pillarStats[1].sessions} de em sessões</p>
              </div>
              <div className="bg-amber-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-amber-600 font-semibold">{pillarStats[1].percentage}%</span>
              </div>
            </div>

            {/* Financial Assistance */}
            <div className={`bg-gradient-to-br ${pillarStats[2].color} rounded-2xl p-4 flex items-center gap-4`}>
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm font-medium mb-0.5">{pillarStats[2].name}</h3>
                <p className="text-slate-600 text-xs">{pillarStats[2].sessions} de em sessões</p>
              </div>
              <div className="bg-emerald-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-emerald-600 font-semibold">{pillarStats[2].percentage}%</span>
              </div>
            </div>

            {/* Legal Assistance */}
            <div className={`bg-gradient-to-br ${pillarStats[3].color} rounded-2xl p-4 flex items-center gap-4`}>
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <Scale className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm font-medium mb-0.5">{pillarStats[3].name}</h3>
                <p className="text-slate-600 text-xs">{pillarStats[3].sessions} de em Saúde</p>
              </div>
              <div className="bg-violet-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-violet-600 font-semibold">{pillarStats[3].percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}
