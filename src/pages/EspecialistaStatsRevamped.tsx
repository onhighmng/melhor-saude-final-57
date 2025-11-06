import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Star, Clock, CheckCircle, ArrowRight, Brain, DollarSign, Scale, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
const EspecialistaStatsRevamped = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const calculateStats = async () => {
      if (!profile?.id) return;
      
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get current month cases
        const { data: monthlyCases } = await supabase
          .from('chat_sessions')
          .select('id, satisfaction_rating, pillar, status, created_at')
          .gte('created_at', startOfMonth.toISOString());

        const { data: callLogs } = await supabase
          .from('specialist_call_logs')
          .select('created_at, completed_at')
          .not('completed_at', 'is', null);

        const avgResponseTime = callLogs?.length > 0
          ? callLogs.reduce((sum, log) => {
              const diff = new Date(log.completed_at).getTime() - new Date(log.created_at).getTime();
              return sum + diff;
            }, 0) / callLogs.length / (1000 * 60)
          : 0;

        const satisfiedCount = monthlyCases?.filter(c => c.satisfaction_rating === 'satisfied').length || 0;
        const satisfactionRate = monthlyCases?.length > 0 
          ? Math.round((satisfiedCount / monthlyCases.length) * 100)
          : 0;

        const pillarCounts = monthlyCases?.reduce((acc, c) => {
          if (c.pillar) {
            acc[c.pillar] = (acc[c.pillar] || 0) + 1;
          }
          return acc;
        }, {}) || {};

        // Get historical data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: historicalCases } = await supabase
          .from('chat_sessions')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: true });

        // Group cases by month
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthlyCaseCounts: { [key: string]: number } = {};
        
        historicalCases?.forEach(caseItem => {
          const date = new Date(caseItem.created_at);
          const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          monthlyCaseCounts[monthYear] = (monthlyCaseCounts[monthYear] || 0) + 1;
        });

        // Get last 4 months for display
        const evolutionData = [];
        for (let i = 3; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          const shortMonth = monthNames[date.getMonth()];
          evolutionData.push({
            month: shortMonth,
            cases: monthlyCaseCounts[monthYear] || 0
          });
        }

        const totalCases = monthlyCases?.length || 0;
        const resolvedCases = monthlyCases?.filter(c => c.status === 'resolved').length || 0;
        const internalResolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
        
        // Calculate actual referrals from specialist call logs
        const { data: referralLogs } = await supabase
          .from('specialist_call_logs')
          .select('id')
          .eq('session_booked', true)
          .eq('specialist_id', profile.id)
          .gte('created_at', startOfMonth.toISOString());
        
        const actualReferrals = referralLogs?.length || 0;
        const referralRate = totalCases > 0 ? Math.round((actualReferrals / totalCases) * 100) : 0;

        // Get recent feedback from users
        const { data: recentFeedback } = await supabase
          .from('feedback')
          .select(`
            rating,
            message,
            created_at,
            profiles!feedback_user_id_fkey(name)
          `)
          .not('rating', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3);

        setStats({
          total_cases: totalCases,
          resolved_cases: resolvedCases,
          avg_response_time: Math.round(avgResponseTime),
          satisfaction_rate: satisfactionRate,
          top_pillars: Object.entries(pillarCounts).map(([pillar, count]) => ({ pillar, count })),
          evolution_data: evolutionData,
          internal_resolution_rate: internalResolutionRate,
          referral_rate: referralRate,
          recent_feedback: recentFeedback || []
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    calculateStats();
  }, [profile?.id]);

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'psychological':
        return Brain;
      case 'financial':
        return DollarSign;
      case 'legal':
        return Scale;
      case 'physical':
        return Dumbbell;
      default:
        return CheckCircle;
    }
  };

  

  // Show loading state while stats are being calculated
  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Estatísticas Pessoais
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o seu desempenho e métricas de atendimento
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">A carregar estatísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Estatísticas Pessoais
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o seu desempenho e métricas de atendimento
        </p>
      </div>

      <BentoGrid className="lg:grid-rows-2 gap-4">
        {/* Taxa de Resolução - Top Left */}
        <BentoCard
          name="Taxa de Resolução"
          description="Casos resolvidos internamente vs encaminhados"
          Icon={TrendingUp}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50" />}
          iconColor="text-orange-600"
            textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="flex flex-col justify-center h-full px-12 py-16">
            <div className="space-y-14">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-semibold">Resolução Interna</span>
                  <span className="font-mono text-xl font-semibold text-blue-900">{stats.internal_resolution_rate}%</span>
                </div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-900 transition-all"
                    style={{ width: `${stats.internal_resolution_rate}%` }}

                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-semibold">Encaminhamentos</span>
                  <span className="font-mono text-xl font-semibold text-blue-900">{stats.referral_rate}%</span>
                </div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-900 transition-all"
                    style={{ width: `${stats.referral_rate}%` }}

                  />
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Evolução Mensal - Top Right */}
        <BentoCard
          name="Evolução Mensal"
          description="Crescimento de casos atendidos"
          Icon={TrendingUp}
          className="lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50" />}
          iconColor="text-indigo-600"
            textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="relative z-20 p-6 h-full flex flex-col justify-between" style={{ minHeight: '300px' }}>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.evolution_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5 }}

                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {stats.evolution_data && stats.evolution_data.length >= 4 && stats.evolution_data[0].cases > 0 ? (
                  <>Crescimento de {Math.round((stats.evolution_data[3].cases - stats.evolution_data[0].cases) / stats.evolution_data[0].cases * 100)}% em 4 meses</>
                ) : (
                  <>Dados insuficientes para calcular crescimento</>
                )}
              </Badge>
            </div>
          </div>
        </BentoCard>

        {/* Top Pilares - Bottom Left */}
        <BentoCard
          name="Top Pilares Atendidos"
          description="Distribuição por especialidade"
          Icon={CheckCircle}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50" />}
          iconColor="text-blue-600"
            textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 space-y-3">
            {stats.top_pillars.map((pillar, index) => {
              const Icon = getPillarIcon(pillar.pillar);
              return (
                <div key={pillar.pillar} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{pillar.label}</p>
                    <p className="text-xs text-muted-foreground">{pillar.count} casos</p>
                  </div>
                  <Badge variant="secondary">{index + 1}º</Badge>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Feedback Recente - Bottom Right */}
        <BentoCard
          name="Feedback Recente"
          description="Últimas avaliações dos utilizadores"
          Icon={Star}
          className="lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />}
          iconColor="text-yellow-600"
            textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6 space-y-3">
            {stats.recent_feedback && stats.recent_feedback.length > 0 ? (
              stats.recent_feedback.map((feedback: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {feedback.profiles?.name || 'Utilizador Anónimo'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{feedback.rating}/10</span>
                        </div>
                      </div>
                      {feedback.message && (
                        <p className="text-xs text-muted-foreground italic">"{feedback.message}"</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">Ainda não há feedback disponível</p>
              </div>
            )}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
};

export default EspecialistaStatsRevamped;
