import { useState, useEffect } from 'react';
import { UserPlus, TrendingUp, Key, Heart, DollarSign, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

export function MobileCompanyEmployees() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAccounts: 50,
    activeAccounts: 47,
    availableAccounts: 3,
    usageRate: 94
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: seatStats } = await supabase
          .rpc('get_company_seat_stats' as any, { p_company_id: profile.company_id })
          .single();

        const stats_data = seatStats as any;
        const active = stats_data.active_employees || 47;
        const pending = stats_data.pending_invites || 3;
        const total = active + pending;
        const rate = total > 0 ? Math.round((active / total) * 100) : 94;

        setStats({
          totalAccounts: total,
          activeAccounts: active,
          availableAccounts: pending,
          usageRate: rate
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?.company_id]);

  const handleGenerateCode = () => {
    console.log('Generate access code');
    // TODO: Implement access code generation
  };

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar..." 
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
          <h1 className="text-slate-900 text-2xl font-bold mb-1">Gestão de Colaboradores</h1>
          <p className="text-slate-500 text-sm">
            Controle e entenda o acesso dos colaboradores à plataforma de bem-estar
          </p>
        </div>

        {/* Access Code Generation */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 font-semibold mb-2">Geração de Códigos de Acesso</h2>
          <p className="text-slate-600 text-sm mb-4">
            Crie códigos únicos de acesso para distribuir aos colaboradores de forma segura e anónima.
          </p>
          <p className="text-slate-500 text-xs mb-4">
            Crie códigos únicos para distribuição em massa aos colaboradores
          </p>
          
          <button 
            onClick={handleGenerateCode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Key className="w-5 h-5" />
            <span>Gerar Código hoje</span>
          </button>

          <div className="mt-6 flex flex-col items-center justify-center py-8">
            <div className="bg-slate-50 rounded-full p-4 mb-3">
              <Key className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Nenhum código gerado ainda</p>
            <p className="text-slate-400 text-xs">Clique no botão acima para gerar códigos de acesso</p>
          </div>
        </div>

        {/* Usage Rate */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 font-semibold mb-6">Taxa de Utilização</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">Total de Contas</span>
              <span className="text-slate-900 font-semibold">{stats.totalAccounts}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">Contas Ativas</span>
              <span className="text-emerald-600 font-semibold">{stats.activeAccounts}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">Contas Disponíveis</span>
              <span className="text-blue-600 font-semibold">{stats.availableAccounts}</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Taxa de Utilização</span>
                <span className="text-blue-600 font-semibold">{stats.usageRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 font-semibold mb-2">Acesso Rápido e Intuitivo</h2>
          <p className="text-slate-600 text-sm mb-6">
            Interface otimizada para gestão eficiente
          </p>

          <div className="flex items-center justify-center gap-8 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-50 rounded-2xl p-3">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-emerald-50 rounded-2xl p-3">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Wellness Pillars */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 font-semibold mb-2">Pilares de Bem-Estar Integrados</h2>
          <p className="text-slate-600 text-sm mb-6">
            Todos os serviços disponíveis numa única plataforma centralizada.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Mental Health */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white/60 rounded-xl p-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-600" />
              </div>
              <span className="text-slate-900 text-sm font-medium">Saúde Mental</span>
            </div>

            {/* Physical Wellness */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white/60 rounded-xl p-3 mb-2">
                <Heart className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-slate-900 text-sm font-medium">Bem-Estar Físico</span>
            </div>

            {/* Financial Assistance */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white/60 rounded-xl p-3 mb-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-slate-900 text-sm font-medium text-center">Assistência Financeira</span>
            </div>

            {/* Legal Assistance */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
              <div className="bg-white/60 rounded-xl p-3 mb-2">
                <Scale className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-slate-900 text-sm font-medium text-center">Assistência Jurídica</span>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}
