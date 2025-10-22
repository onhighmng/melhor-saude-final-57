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
import { mockSessionAnalytics } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";
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

const CompanySessions = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Add company-page class to body for light blue background
    document.body.classList.add('company-page');
    
    // Cleanup: remove class when component unmounts
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Sessões & Utilização</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Análise detalhada da utilização de sessões por pilar e especialista
          </p>
        </div>
        
        <Button 
          onClick={handleExportSessions}
          size="lg"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Session Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Sessões Contratadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {mockSessionAnalytics.totalContracted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total incluído no contrato
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Sessões Utilizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {mockSessionAnalytics.totalUsed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              Taxa de Utilização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {mockSessionAnalytics.utilizationRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Eficiência do programa
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Colaboradores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {mockSessionAnalytics.employeesUsingServices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Usaram pelo menos 1 sessão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pillar Analysis with Stats Cards */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-3xl font-bold">Análise por Pilar</h2>
        </div>
        
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {mockSessionAnalytics.pillarBreakdown.map((pillar, index) => {
            const Icon = getPillarIcon(pillar.pillar).type;
            return (
              <div key={index} className="p-0 gap-0 rounded-xl border bg-card text-card-foreground shadow flex flex-col">
                <div className="px-6 py-6">
                  <dd className="flex items-start justify-between space-x-2">
                    <div className="flex items-center gap-2">
                      {getPillarIcon(pillar.pillar)}
                      <span className="text-base font-medium text-foreground">
                        {pillar.pillar}
                      </span>
                    </div>
                    <span className="text-base font-semibold text-emerald-700 dark:text-emerald-500">
                      {pillar.utilizationRate}%
                    </span>
                  </dd>
                  <dd className="mt-3 text-4xl font-bold text-foreground">
                    {pillar.sessionsUsed}
                  </dd>
                  <dd className="mt-1 text-base text-muted-foreground">
                    de {pillar.sessionsAvailable} sessões
                  </dd>
                </div>
                <div className="flex justify-end border-t border-border !p-0">
                  <button className="px-6 py-4 text-base font-medium text-primary hover:text-primary/90">
                    Ver detalhes →
                  </button>
                </div>
              </div>
            );
          })}
        </dl>

        {/* Radial Chart Cards */}
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockSessionAnalytics.pillarBreakdown.map((pillar, index) => {
            const chartData = [{
              name: pillar.pillar,
              capacity: pillar.utilizationRate,
              current: pillar.sessionsUsed,
              allowed: pillar.sessionsAvailable,
              fill: `hsl(var(--chart-${index + 1}))`
            }];

            const chartConfig = {
              pillar: {
                label: pillar.pillar,
                color: `hsl(var(--chart-${index + 1}))`
              },
              background: {
                label: "Background",
                color: "hsl(var(--muted))"
              }
            };

            return (
              <div key={index} className="p-6 rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-0 flex items-center space-x-4">
                  <div className="relative flex items-center justify-center">
                    <div className="h-[100px] w-[100px]">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={`hsl(var(--chart-${index + 1}))`}
                          strokeWidth="12"
                          strokeDasharray={`${pillar.utilizationRate * 2.51} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-foreground">
                        {pillar.utilizationRate}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <dt className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {getPillarIcon(pillar.pillar)}
                      {pillar.pillar}
                    </dt>
                    <dd className="text-base text-muted-foreground mt-1">
                      {pillar.sessionsUsed} de {pillar.sessionsAvailable} utilizadas
                    </dd>
                    <dd className="text-sm text-muted-foreground mt-2">
                      Top: {pillar.topSpecialists[0]?.name}
                    </dd>
                  </div>
                </div>
              </div>
            );
          })}
        </dl>
      </div>


      {/* Privacy Notice */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex items-start gap-3 p-4">
          <Activity className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Dados Agregados e Anónimos
            </p>
            <p className="text-sm text-muted-foreground">
              Todas as informações apresentadas são agregadas e anónimas para proteger a privacidade dos colaboradores. 
              Não são exibidos dados individuais ou conteúdo clínico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySessions;