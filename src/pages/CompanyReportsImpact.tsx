import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  FileText,
  Download,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Activity,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import ResourceUsageCard from '@/components/ui/horizontal-bar-chart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState } from '@/components/ui/empty-state';
import { CompanySubscriptionBanner } from '@/components/company/CompanySubscriptionBanner';

const CompanyReportsImpact = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { toast } = useToast();
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [pillarDistribution, setPillarDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (profile?.company_id) {
      loadMetrics();
    } else {
      setLoading(false);
    }
  }, [profile?.company_id, dateRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_company_monthly_metrics', {
        p_company_id: profile?.company_id,
        p_start_date: dateRange.start,
        p_end_date: dateRange.end
      });
      
      if (error) throw error;
      
      setMetrics(data);
      
      // Transform pillar breakdown for chart
      if (data?.pillar_breakdown) {
        setPillarDistribution(data.pillar_breakdown.map((p: any) => ({
          name: p.pillar,
          value: p.sessions,
          percentage: p.percentage
        })));
      } else {
        setPillarDistribution([]);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as métricas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const metricCards = metrics ? [
    {
      title: "Colaboradores Ativos",
      value: metrics.employees?.active || 0,
      icon: <Users className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Sessões Realizadas",
      value: metrics.subscription?.period_sessions_used || 0,
      icon: <Calendar className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      textColor: "text-green-700 dark:text-green-300"
    },
    {
      title: "Satisfação Média",
      value: `${metrics.satisfaction?.avg_rating || 0}/10`,
      icon: <Star className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900",
      textColor: "text-yellow-700 dark:text-yellow-300"
    },
    {
      title: "Taxa de Utilização",
      value: `${metrics.subscription?.utilization_rate || 0}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      textColor: "text-purple-700 dark:text-purple-300"
    }
  ] : [];

  useEffect(() => {
    // Add company-page class to body for light blue background
    document.body.classList.add('company-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);

  // Cycle through cards every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Call edge function to generate PDF
      const { data, error } = await supabase.functions.invoke('generate-company-report-pdf', {
        body: {
          company_id: profile?.company_id,
          start_date: dateRange.start,
          end_date: dateRange.end
        }
      });
      
      if (error) throw error;

      // Download PDF
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf}`;
      link.download = data.filename;
      link.click();

      toast({
        title: "Relatório exportado com sucesso!",
        description: "O PDF foi gerado e transferido para downloads"
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading || !metrics) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">A carregar relatórios...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no sessions or employees
  if (companyMetrics.totalSessions === 0 && companyMetrics.activeEmployees === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Relatórios e Impacto
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Análise detalhada do bem-estar dos colaboradores e impacto dos programas
          </p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="Relatórios estarão disponíveis em breve"
          description="Os relatórios de impacto estarão disponíveis quando os colaboradores começarem a usar a plataforma e completarem sessões."
        />
      </section>
    );
  }

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-yellow-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Assistência Financeira':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
          Relatórios e Impacto
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Análise detalhada do bem-estar dos colaboradores e impacto dos programas
        </p>
      </div>

      {/* Subscription Banner */}
      <CompanySubscriptionBanner compact={true} />

      <div>
        <Button 
          onClick={handleExportReport}
          disabled={isExporting}
          size="lg"
          className="gap-2 mt-6"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Gerando...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Exportar Relatório Mensal
            </>
          )}
        </Button>
      </div>

      {/* Main Content - Metrics Stack on Left, Charts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Half - Stacked Animated Cards */}
        <div className="relative h-96 flex items-center justify-center">
          {metricCards.map((card, index) => {
            const isActive = index === currentCardIndex;
            const stackIndex = (index - currentCardIndex + 4) % 4;
            
            return (
              <motion.div
                key={card.title}
                className={`absolute ${card.bgColor} rounded-2xl p-8 shadow-lg border border-border w-full max-w-sm`}
                style={{
                  top: `${stackIndex * 20}px`,
                  scale: 1 - stackIndex * 0.08,
                  zIndex: 4 - stackIndex,
                }}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  y: isActive ? 0 : stackIndex * 10,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-muted-foreground">{card.title}</h3>
                  <div className={`${card.bgColor.replace('bg-gradient-to-br', 'bg')} p-2 rounded-lg`}>
                    {card.icon}
                  </div>
                </div>
                <p className={`text-5xl font-bold ${card.textColor}`}>{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Right Half - All Charts */}
        <div className="space-y-8">
          {/* Resource Usage Chart */}
          <ResourceUsageCard />

          {/* Distribution by Pillar */}
          <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl">
              Distribuição por Pilar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pillarDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="sessions"
                    label={({ pillar, percentage }) => `${pillar}: ${percentage}%`}
                    isAnimationActive={false}
                    style={{ fontSize: '16px', fontWeight: '600' }}
                  >
                    {pillarDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {pillarDistribution.map((pillar, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: pillar.color }}
                  ></div>
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">{pillar.pillar}</span>
                    <span className="text-5xl font-extrabold text-foreground font-sans">{pillar.sessions}</span>
                    <span className="text-base text-muted-foreground">sessões</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pillar & Satisfaction */}
        <Card className="border-0 shadow-sm" style={{ height: '400px' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5" />
              Destaques do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Pilar Mais Utilizado</h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {metrics?.top_pillar?.name || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {metrics?.top_pillar?.sessions || 0} sessões realizadas
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Satisfação dos Colaboradores</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avaliação Média</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {metrics?.satisfaction?.avg_rating || 0}/10
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Alta Satisfação</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {metrics?.satisfaction?.satisfaction_rate || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({metrics?.satisfaction?.high_satisfaction_count || 0} de {metrics?.satisfaction?.rated_sessions || 0})
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </section>
  );
};

export default CompanyReportsImpact;
