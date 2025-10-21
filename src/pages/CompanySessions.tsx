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
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
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
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Financeira':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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
          <h1 className="text-3xl font-bold text-foreground">Sessões & Utilização</h1>
          <p className="text-muted-foreground mt-1">
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

      {/* Pillar Breakdown Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise por Pilar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSessionAnalytics.pillarBreakdown.map((pillar, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getPillarIcon(pillar.pillar)}
                    <h4 className="font-semibold text-lg">{pillar.pillar}</h4>
                    <Badge className={getPillarColor(pillar.pillar)}>
                      {pillar.utilizationRate}% utilizado
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{pillar.sessionsUsed}</div>
                    <div className="text-sm text-muted-foreground">
                      de {pillar.sessionsAvailable} sessões
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso de utilização</span>
                    <span>{pillar.utilizationRate}%</span>
                  </div>
                  <Progress value={pillar.utilizationRate} className="h-2" />
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2">Especialistas mais envolvidos:</h5>
                  <div className="flex flex-wrap gap-2">
                    {pillar.topSpecialists.map((specialist, specIndex) => (
                      <div key={specIndex} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                        <span className="font-medium">{specialist.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {specialist.sessions} sessões
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência Mensal de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSessionAnalytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    name="Total de Sessões"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="byPillar.mental" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Saúde Mental"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="byPillar.physical" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    name="Bem-Estar Físico"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários de Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSessionAnalytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Days Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Distribuição por Dias da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSessionAnalytics.peakDays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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