import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Users,
  TrendingUp,
  Download,
  Clock,
  BarChart3,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Activity
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { CompanySubscriptionBanner } from '@/components/company/CompanySubscriptionBanner';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AnimatedInsights = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const insights = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "Saúde Mental em Foco",
      text: "Acompanhamento psicológico especializado disponível 24/7 para todos os colaboradores, garantindo suporte emocional contínuo e confidencial."
    },
    {
      icon: <Heart className="h-8 w-8 text-yellow-600" />,
      title: "Bem-Estar Físico Integrado",
      text: "Programas personalizados de fitness e nutrição que se adaptam ao estilo de vida de cada colaborador, promovendo hábitos saudáveis sustentáveis."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      title: "Estabilidade Financeira",
      text: "Consultoria financeira profissional para planeamento patrimonial, gestão de dívidas e construção de um futuro financeiro seguro."
    },
    {
      icon: <Scale className="h-8 w-8 text-purple-600" />,
      title: "Apoio Jurídico Completo",
      text: "Assistência legal especializada em diversas áreas do direito, oferecendo orientação clara e suporte em questões jurídicas pessoais."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Análise em Tempo Real",
      text: "Dashboard intuitivo com métricas detalhadas de utilização, permitindo decisões estratégicas baseadas em dados concretos e atualizados."
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      title: "Engagement Elevado",
      text: "Plataforma que promove a participação ativa dos colaboradores, aumentando significativamente a satisfação e retenção de talentos."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [insights.length]);

  return (
    <div className="relative h-64 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-start justify-center space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            {insights[currentIndex].icon}
            <h3 className="text-2xl font-bold text-foreground">
              {insights[currentIndex].title}
            </h3>
          </div>
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground">
            {insights[currentIndex].text}
          </p>
          <div className="flex gap-2 mt-4">
            {insights.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "w-8 bg-primary" 
                    : "w-1.5 bg-muted"
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const CompanySessions = () => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({ 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadSessionAnalytics = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        // Set empty analytics to prevent infinite loading
        setAnalytics({
          totalContracted: 0,
          totalUsed: 0,
          utilizationRate: 0,
          employeesUsingServices: 0,
          pillarBreakdown: []
        });
        return;
      }
      
      setLoading(true);
      try {
        // Use the same RPC function as CompanyReportsImpact
        const { data, error } = await supabase.rpc('get_company_monthly_metrics' as any, {
          p_company_id: profile.company_id,
          p_start_date: dateRange.start,
          p_end_date: dateRange.end
        });

        if (error) throw error;

        const metricsData = data as any;

        // Extract pillar breakdown with formatted names
        const pillarBreakdown = metricsData?.pillar_breakdown?.map((p: any) => ({
          pillar: p.pillar,
          sessionsUsed: p.sessions,
          sessionsAvailable: metricsData.subscription?.sessions_allocated || 0,
          utilizationRate: p.percentage || 0
        })) || [];

        // Get employee count
        const employeesUsingServices = metricsData?.employees?.active || 0;

        setAnalytics({
          totalContracted: metricsData?.subscription?.sessions_allocated || 0,
          totalUsed: metricsData?.subscription?.period_sessions_used || 0,
          utilizationRate: metricsData?.subscription?.utilization_rate || 0,
          employeesUsingServices,
          pillarBreakdown
        });
      } catch (error) {
        console.error('Error loading session analytics:', error);
        // Set empty analytics on error
        setAnalytics({
          totalContracted: 0,
          totalUsed: 0,
          utilizationRate: 0,
          employeesUsingServices: 0,
          pillarBreakdown: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessionAnalytics();
  }, [profile?.company_id, dateRange.start, dateRange.end]);
  const { toast } = useToast();

  useEffect(() => {
    document.body.classList.add('company-page');
    
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);

  const handleExportSessions = () => {
    toast({
      title: "Relatório exportado",
      description: "Relatório de sessões foi gerado com sucesso"
    });
  };

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
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPillarColor = (pillar: string) => {
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
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show empty state if no sessions yet
  if (!loading && analytics && (analytics.totalUsed as number) === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Sessões & Utilização
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Análise detalhada da utilização de sessões por pilar e especialista
          </p>
        </div>
        <EmptyState
          icon={Calendar}
          title="Nenhuma sessão agendada ainda"
          description="As estatísticas de sessões aparecerão aqui quando os colaboradores começarem a agendar e completar sessões de bem-estar."
        />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      {/* Header Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
          Sessões & Utilização
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Análise detalhada da utilização de sessões por pilar e especialista
        </p>
      </div>

      {/* Subscription Banner */}
      <div className="mb-8">
        <CompanySubscriptionBanner compact={true} />
      </div>

      <div>
        <Button 
          onClick={handleExportSessions}
          size="lg"
          className="gap-2 mt-6"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 relative mb-12 sm:mb-16 lg:mb-20">
        {/* Left Block - Session Overview with Animated Cards */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-l-xl">
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
            
            {/* Session Stats Cards Stack */}
            <div className="relative mx-auto h-64 w-full my-4">
              <motion.div
                className="absolute bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: 0,
                  scale: 1,
                  zIndex: 3,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessões Contratadas</span>
                  </div>
                  <div className="text-5xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                    {Number(analytics?.totalContracted) || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total incluído no contrato
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -10,
                  scale: 0.94,
                  zIndex: 2,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessões Utilizadas</span>
                  </div>
                  <div className="text-5xl font-bold text-green-700 dark:text-green-300 mb-2">
                    {Number(analytics?.totalUsed) || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -20,
                  scale: 0.88,
                  zIndex: 1,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Taxa de Utilização</span>
                  </div>
                  <div className="text-5xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                    {Number(analytics?.utilizationRate) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Eficiência do programa</p>
                </div>
              </motion.div>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Dashboard Intuitivo de <span className="text-primary">Sessões</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Visualize métricas de utilização com componentes elegantes que fornecem insights acionáveis em tempo real.
            </span>
          </h3>
        </div>

        {/* Right Block - Pillar Integration */}
        <div className="flex flex-col items-center justify-start border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-r-xl">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-4 sm:mb-6 leading-relaxed">
            Pilares de Bem-Estar <span className="text-primary">Integrados</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Acesso completo a todos os pilares de saúde numa única plataforma centralizada e eficiente.
            </span>
          </h3>
          
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-background px-4 sm:px-6 lg:px-8 py-2 font-medium transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
            )}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-background border border-border rounded-2xl sm:rounded-3xl z-10 w-full">
              {(analytics?.pillarBreakdown as any[])?.map((pillar: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-xl sm:rounded-2xl hover:bg-muted/50 transition animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getPillarIcon(String(pillar.pillar))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {String(pillar.pillar)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {pillar.sessionsUsed as number} de {pillar.sessionsAvailable as number} sessões
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <Badge className={`${getPillarColor(pillar.pillar as string)} text-sm px-3 py-1`}>
                      {pillar.utilizationRate as number}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>

      {/* Stats and Impact Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex justify-center items-center p-6 sm:p-8 bg-card border border-border rounded-xl">
          <div className="grid grid-cols-2 gap-8 sm:gap-12 w-full text-center">
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                {Number(analytics?.totalContracted) || 0}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Sessões Contratadas</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-600">
                {Number(analytics?.totalUsed) || 0}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Sessões Utilizadas</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-600">
                {Number(analytics?.utilizationRate) || 0}%
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Taxa Utilização</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600">
                {Number(analytics?.employeesUsingServices) || 0}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Colaboradores Ativos</p>
            </div>
          </div>
        </div>
        
        <div className="relative p-6 sm:p-8 bg-card border border-border rounded-xl overflow-hidden">
          <AnimatedInsights />
        </div>
      </div>
    </section>
  );
};

export default CompanySessions;