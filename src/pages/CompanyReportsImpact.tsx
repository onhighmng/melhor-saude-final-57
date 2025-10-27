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

const CompanyReportsImpact = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { toast } = useToast();
  const { profile } = useAuth();
  const [companyMetrics, setCompanyMetrics] = useState<any>(null);
  const [pillarDistribution, setPillarDistribution] = useState<any[]>([]);
  const [wellnessTrends, setWellnessTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!profile?.company_id) return;
      
      try {
        // Load company data
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        // Load bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('company_id', profile.company_id);

        // Load employees
        const { data: employees } = await supabase
          .from('company_employees')
          .select('*')
          .eq('company_id', profile.company_id);

        // Calculate metrics
        const activeEmployees = employees?.filter(e => e.is_active).length || 0;
        const totalSessions = bookings?.filter(b => b.status === 'completed').length || 0;
        const ratings = bookings?.filter(b => b.rating).map(b => b.rating) || [];
        const avgSatisfaction = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
          : 0;
        const utilizationRate = company?.sessions_allocated > 0
          ? Math.round((company.sessions_used / company.sessions_allocated) * 100)
          : 0;

        setCompanyMetrics({
          activeEmployees,
          totalSessions,
          avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
          utilizationRate
        });

        // Calculate pillar distribution
        const pillarCounts = bookings?.reduce((acc, b) => {
          const pillar = b.pillar || 'unknown';
          acc[pillar] = (acc[pillar] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const pillarColors = {
          'saude_mental': '#3B82F6',
          'bem_estar_fisico': '#F59E0B',
          'assistencia_financeira': '#10B981',
          'assistencia_juridica': '#8B5CF6'
        };

        const pillarNames = {
          'saude_mental': 'Saúde Mental',
          'bem_estar_fisico': 'Bem-Estar Físico',
          'assistencia_financeira': 'Assistência Financeira',
          'assistencia_juridica': 'Assistência Jurídica'
        };

        const distribution = Object.entries(pillarCounts).map(([pillar, count]) => ({
          pillar: pillarNames[pillar as keyof typeof pillarNames] || pillar,
          sessions: count,
          percentage: Math.round((count / totalSessions) * 100),
          color: pillarColors[pillar as keyof typeof pillarColors] || '#6B7280'
        }));

        setPillarDistribution(distribution);

        // Calculate wellness trends (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const monthBookings = bookings?.filter(b => {
            const bookingDate = new Date(b.booking_date);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
          }) || [];

          const monthRatings = monthBookings.filter(b => b.rating).map(b => b.rating);
          const avgWellness = monthRatings.length > 0
            ? monthRatings.reduce((sum, r) => sum + r, 0) / monthRatings.length
            : 0;

          monthlyData.push({
            month: date.toLocaleDateString('pt-PT', { month: 'short' }),
            avgWellness: Math.round(avgWellness * 10) / 10,
            sessions: monthBookings.length
          });
        }

        setWellnessTrends(monthlyData);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar análises',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [profile?.company_id, toast]);

  const metricCards = companyMetrics ? [
    {
      title: "Colaboradores Ativos",
      value: companyMetrics.activeEmployees,
      icon: <Users className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Sessões Realizadas",
      value: companyMetrics.totalSessions,
      icon: <Calendar className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      textColor: "text-green-700 dark:text-green-300"
    },
    {
      title: "Satisfação Média",
      value: `${companyMetrics.avgSatisfaction}/10`,
      icon: <Star className="h-6 w-6" />,
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900",
      textColor: "text-yellow-700 dark:text-yellow-300"
    },
    {
      title: "Taxa de Utilização",
      value: `${companyMetrics.utilizationRate}%`,
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
    
    // Simulate PDF generation
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: "Relatório mensal foi gerado com sucesso"
      });
      setIsExporting(false);
    }, 2000);
  };

  if (loading || !companyMetrics) {
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

        {/* Wellness Trend */}
        <Card className="border-0 shadow-sm" style={{ height: '400px' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5" />
              Tendência de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0" style={{ height: 'calc(100% - 80px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wellnessTrends} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    style={{ fontSize: '16px' }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    style={{ fontSize: '16px' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgWellness' ? `${value}/10` : value,
                      name === 'avgWellness' ? 'Bem-estar médio' : 'Sessões'
                    ]}
                    contentStyle={{ fontSize: '16px' }}
                  />

                  <Line 
                    type="monotone" 
                    dataKey="avgWellness" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      </div>
    </section>
  );
};

export default CompanyReportsImpact;
