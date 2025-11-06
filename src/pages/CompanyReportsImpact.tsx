import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  FileText,
  Brain,
  Heart,
  DollarSign,
  Scale,
  BarChart3
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState } from '@/components/ui/empty-state';
import { CompanySubscriptionBanner } from '@/components/company/CompanySubscriptionBanner';
const CompanyReportsImpact = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [pillarDistribution, setPillarDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({ 
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
      const { data, error } = await supabase.rpc('get_company_monthly_metrics' as any, {
        p_company_id: profile?.company_id,
        p_start_date: dateRange.start,
        p_end_date: dateRange.end
      });
      
      if (error) throw error;
      
      const metricsData = data as any;
      setMetrics(metricsData);
      
      // Transform pillar breakdown for chart
      if (metricsData?.pillar_breakdown) {
        const getPillarColor = (pillar: string) => {
          switch (pillar) {
            case 'Saúde Mental': return '#3b82f6'; // blue-500
            case 'Bem-Estar Físico': return '#eab308'; // yellow-500
            case 'Assistência Financeira': return '#22c55e'; // green-500
            case 'Assistência Jurídica': return '#a855f7'; // purple-500
            default: return '#6b7280'; // gray-500
          }
        };
        
        setPillarDistribution(metricsData.pillar_breakdown.map((p: any) => ({
          pillar: p.pillar,
          name: p.pillar,
          value: p.sessions,
          sessions: p.sessions,
          percentage: p.percentage,
          color: getPillarColor(p.pillar)
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

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Call edge function to generate report
      const { data, error } = await supabase.functions.invoke('generate-company-report-pdf', {
        body: {
          company_id: profile?.company_id,
          start_date: dateRange.start,
          end_date: dateRange.end
        }
      });
      
      if (error) throw error;

      // Download HTML report (can be printed to PDF)
      const link = document.createElement('a');
      const contentType = data.contentType || 'text/html';
      link.href = `data:${contentType};base64,${data.pdf}`;
      link.download = data.filename;
      link.click();

      // Open in new tab for printing
      const htmlContent = atob(data.pdf);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
          newWindow.print();
        }, 500);
      }

      toast({
        title: "Relatório gerado com sucesso!",
        description: data.message || "O relatório foi aberto numa nova janela. Use Ctrl+P (Cmd+P) para guardar como PDF.",
        duration: 6000
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

  

  // Show empty state if no sessions or employees
  if (metrics?.subscription?.period_sessions_used === 0 && metrics?.employees?.active === 0) {
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

      {/* Main Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <Card key={card.title} className={`${card.bgColor} border-0 shadow-sm`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">{card.title}</h3>
                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                  {card.icon}
                </div>
              </div>
              <p className={`text-4xl font-bold ${card.textColor}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution by Pillar */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              Distribuição por Pilar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pillarDistribution.map((pillar, index) => {
                const maxSessions = Math.max(...pillarDistribution.map(p => p.sessions));
                const percentage = maxSessions > 0 ? (pillar.sessions / maxSessions) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: pillar.color }}

                        />
                        <span className="font-medium">{pillar.pillar}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{pillar.sessions}</span>
                        <span className="text-sm text-muted-foreground ml-1">sessões</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: pillar.color
                        }}

                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Pillar & Satisfaction */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
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
    </section>
  );
};

export default CompanyReportsImpact;
