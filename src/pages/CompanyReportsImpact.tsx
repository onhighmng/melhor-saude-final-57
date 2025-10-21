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
  Scale
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

const CompanyReportsImpact = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
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
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Financeira':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e Impacto</h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada do bem-estar dos colaboradores e impacto dos programas
          </p>
        </div>
        
        <Button 
          onClick={handleExportReport}
          disabled={isExporting}
          size="lg"
          className="gap-2"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Colaboradores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {mockCompanyMetrics.activeEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Sessões Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {mockCompanyMetrics.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600" />
              Satisfação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Star className="h-6 w-6 fill-amber-600 text-amber-600" />
              {mockCompanyMetrics.avgSatisfaction}/10
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avaliação dos colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Taxa de Utilização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {mockCompanyMetrics.utilizationRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Colaboradores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Calculator Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Análise de ROI (Retorno do Investimento)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Custo Mensal</p>
                  <p className="text-2xl font-bold text-green-900">{mockROIData.monthlyCost.toLocaleString()} MZN</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Poupanças Estimadas (Mensais)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm">Redução de Absenteísmo</span>
                    <span className="font-semibold text-blue-900">{mockROIData.estimatedSavings.absenteeism.toLocaleString()} MZN</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm">Custos de Saúde</span>
                    <span className="font-semibold text-green-900">{mockROIData.estimatedSavings.healthcare.toLocaleString()} MZN</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-sm">Aumento de Produtividade</span>
                    <span className="font-semibold text-purple-900">{mockROIData.estimatedSavings.productivity.toLocaleString()} MZN</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="text-sm">Retenção de Talentos</span>
                    <span className="font-semibold text-orange-900">{mockROIData.estimatedSavings.retention.toLocaleString()} MZN</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">ROI Total</h3>
                <div className="text-4xl font-bold text-emerald-700 mb-2">{mockROIData.roiPercentage}%</div>
                <p className="text-sm text-emerald-600">Retorno do investimento</p>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Período de Retorno</h4>
                <div className="text-2xl font-bold text-slate-700">{mockROIData.paybackPeriod} meses</div>
                <p className="text-sm text-gray-600">Para recuperar o investimento</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Poupança Líquida</h4>
                <div className="text-2xl font-bold text-blue-700">{(mockROIData.totalEstimatedSavings - mockROIData.monthlyCost).toLocaleString()} MZN</div>
                <p className="text-sm text-blue-600">Poupança mensal líquida</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absenteeism Estimation Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estimativa de Redução de Absenteísmo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Taxa Atual</h4>
                  <div className="text-2xl font-bold text-red-900">{mockAbsenteeismData.currentRate}%</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-1">Redução Estimada</h4>
                  <div className="text-2xl font-bold text-green-900">{mockAbsenteeismData.estimatedReduction}%</div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Sessões Mensais</h4>
                <div className="text-3xl font-bold text-blue-700">{mockAbsenteeismData.monthlySessions}</div>
                <p className="text-sm text-blue-600">Total de sessões realizadas</p>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAbsenteeismData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}%`,
                      name === 'before' ? 'Antes do Programa' : 'Após o Programa'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="before" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                    name="Antes do Programa"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="after" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    name="Após o Programa"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Completed Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Objetivos Concluídos pelos Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <h4 className="text-lg font-semibold text-indigo-900 mb-2">Taxa de Conclusão</h4>
              <div className="text-4xl font-bold text-indigo-700 mb-2">{mockEmployeeMetrics.goalsCompleted.completionRate}%</div>
              <p className="text-sm text-indigo-600">
                {mockEmployeeMetrics.goalsCompleted.completedGoals} de {mockEmployeeMetrics.goalsCompleted.totalGoals} objetivos
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="text-lg font-semibold text-green-900 mb-2">Objetivos Concluídos</h4>
              <div className="text-4xl font-bold text-green-700 mb-2">{mockEmployeeMetrics.goalsCompleted.completedGoals}</div>
              <p className="text-sm text-green-600">Total de objetivos atingidos</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <h4 className="text-lg font-semibold text-purple-900 mb-2">Sessões por Colaborador</h4>
              <div className="text-4xl font-bold text-purple-700 mb-2">{mockEmployeeMetrics.averageSessionsPerEmployee}</div>
              <p className="text-sm text-purple-600">Média de sessões utilizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution by Pillar */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
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
                  >
                    {mockPillarDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mockPillarDistribution.map((pillar, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: pillar.color }}
                  ></div>
                  <span className="font-medium">{pillar.pillar}</span>
                  <span className="text-muted-foreground">({pillar.sessions} sessões)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wellness Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockWellnessTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[6, 10]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgWellness' ? `${value}/10` : value,
                      name === 'avgWellness' ? 'Bem-estar médio' : 'Sessões'
                    ]}
                  />
                  <Legend />
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
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Bem-estar médio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Sessões realizadas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aggregated Statistics - Anonymous Data Only */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas Agregadas por Pilar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockPillarDistribution.map((pillar, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getPillarIcon(pillar.pillar)}
                    <h4 className="font-semibold text-sm">{pillar.pillar}</h4>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sessões:</span>
                      <span className="font-medium">{pillar.sessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Percentagem:</span>
                      <span className="font-medium">{pillar.percentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              📊 Todos os dados apresentados são agregados e anónimos para proteger a privacidade dos colaboradores
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyReportsImpact;
