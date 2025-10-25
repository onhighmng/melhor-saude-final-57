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
  Activity
} from 'lucide-react';
import { 
  mockCompanyMetrics, 
  mockPillarDistribution, 
  mockWellnessTrends, 
  mockEmployeeHighlights,
  mockROIData,
  mockAbsenteeismData,
  mockEmployeeMetrics
} from '@/data/companyMetrics';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import ResourceUsageCard from '@/components/ui/horizontal-bar-chart';

const CompanyReportsImpact = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

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
    
    // Simulate PDF generation
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: "Relatório mensal foi gerado com sucesso"
      });
      setIsExporting(false);
    }, 2000);
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-8">
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

      {/* Top Section - Stacked Cards and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 relative mb-12 sm:mb-16 lg:mb-20">
        {/* Left Block - Metric Cards Stack */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-l-xl">
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
            
            {/* Metric Stats Cards Stack */}
            <div className="relative mx-auto h-64 w-full my-4">
              <motion.div
                className="absolute bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: 0,
                  scale: 1,
                  zIndex: 4,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">Colaboradores Ativos</span>
                  </div>
                  <div className="text-5xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                    {mockCompanyMetrics.activeEmployees}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total de colaboradores
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -10,
                  scale: 0.94,
                  zIndex: 3,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">Sessões Realizadas</span>
                  </div>
                  <div className="text-5xl font-bold text-green-700 dark:text-green-300 mb-2">
                    {mockCompanyMetrics.totalSessions}
                  </div>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -20,
                  scale: 0.88,
                  zIndex: 2,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-2">
                    <Star className="h-5 w-5" />
                    <span className="text-sm font-medium">Satisfação Média</span>
                  </div>
                  <div className="text-5xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                    {mockCompanyMetrics.avgSatisfaction}/10
                  </div>
                  <p className="text-sm text-muted-foreground">Avaliação dos colaboradores</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 h-64 w-full rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between"
                animate={{
                  top: -30,
                  scale: 0.82,
                  zIndex: 1,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Taxa de Utilização</span>
                  </div>
                  <div className="text-5xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                    {mockCompanyMetrics.utilizationRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Colaboradores ativos</p>
                </div>
              </motion.div>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Métricas de <span className="text-primary">Impacto</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Visualize as principais métricas de desempenho do programa de bem-estar em tempo real.
            </span>
          </h3>
        </div>

        {/* Right Block - Resource Usage Chart */}
        <div className="flex flex-col items-center justify-center border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-r-xl">
          <ResourceUsageCard />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    data={mockPillarDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="sessions"
                    label={({ pillar, percentage }) => `${pillar}: ${percentage}%`}
                    isAnimationActive={false}
                    style={{ fontSize: '16px', fontWeight: '600' }}
                  >
                    {mockPillarDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {mockPillarDistribution.map((pillar, index) => (
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
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <TrendingUp className="h-6 w-6" />
              Tendência de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockWellnessTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    style={{ fontSize: '16px' }}
                  />
                  <YAxis 
                    domain={[6, 10]} 
                    style={{ fontSize: '16px' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgWellness' ? `${value}/10` : value,
                      name === 'avgWellness' ? 'Bem-estar médio' : 'Sessões'
                    ]}
                    contentStyle={{ fontSize: '16px' }}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'avgWellness' ? 'Bem-estar médio' : 
                      value === 'sessions' ? 'Sessões realizadas' : value
                    }
                    wrapperStyle={{ fontSize: '18px' }}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CompanyReportsImpact;
