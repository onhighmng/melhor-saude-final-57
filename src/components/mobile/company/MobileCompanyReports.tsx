import { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export function MobileCompanyReports() {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        // Calculate date range based on selected period
        const endDate = new Date().toISOString().split('T')[0];
        let startDate: string;
        
        if (selectedPeriod === 'week') {
          const date = new Date();
          date.setDate(date.getDate() - 7);
          startDate = date.toISOString().split('T')[0];
        } else if (selectedPeriod === 'quarter') {
          const date = new Date();
          date.setMonth(date.getMonth() - 3);
          startDate = date.toISOString().split('T')[0];
        } else {
          // month (default)
          const date = new Date();
          date.setMonth(date.getMonth() - 1);
          startDate = date.toISOString().split('T')[0];
        }

        const { data, error } = await supabase.rpc('get_company_monthly_metrics' as any, {
          p_company_id: profile.company_id,
          p_start_date: startDate,
          p_end_date: endDate
        });

        if (error) throw error;

        setMetrics(data);
      } catch (error) {
        console.error('Error loading company metrics:', error);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [profile?.company_id, selectedPeriod]);

  if (loading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar relatórios..." showProgress={true} />;
  }

  const satisfactionRate = metrics?.satisfaction_rate 
    ? Math.round(metrics.satisfaction_rate) 
    : 0;
  const activeEmployees = metrics?.employees?.active || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Relatórios</h1>
          <p className="text-gray-500 text-sm">Análises e métricas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'quarter' && 'Trimestre'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none">
            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{satisfactionRate}%</p>
            <p className="text-xs text-gray-600">Taxa de Satisfação</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none">
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
            <p className="text-xs text-gray-600">Colaboradores Ativos</p>
          </Card>
        </div>

        {/* Reports List - Note about on-demand generation */}
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm mb-2">Relatórios detalhados</p>
          <p className="text-gray-500 text-xs">Aceda à versão desktop para gerar relatórios completos</p>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}

