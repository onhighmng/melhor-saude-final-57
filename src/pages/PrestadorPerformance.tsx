import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Star,
  Users,
  TrendingUp,
  Download,
  Euro,
  Percent,
  BarChart3
} from 'lucide-react';
import { 
  mockPrestadorPerformance, 
  mockSessionEvolution, 
  mockFinancialData 
} from '@/data/prestadorMetrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";

const PrestadorPerformance = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportReport = async () => {
    setIsExporting(true);
    
    // Simulate CSV generation
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: "Relatório mensal foi gerado em CSV com sucesso"
      });
      setIsExporting(false);
    }, 2000);
  };

  // Calculate financial totals
  const totalGrossValue = mockFinancialData.reduce((sum, item) => sum + item.grossValue, 0);
  const totalCommission = mockFinancialData.reduce((sum, item) => sum + item.commission, 0);
  const totalNetValue = mockFinancialData.reduce((sum, item) => sum + item.netValue, 0);
  const totalSessions = mockFinancialData.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Desempenho</h1>
          <p className="text-muted-foreground mt-1">
            Métricas e análise financeira do seu desempenho
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
              <Download className="h-4 w-4" />
              Exportar Relatório Mensal (CSV)
            </>
          )}
        </Button>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Sessões Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {mockPrestadorPerformance.sessionsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessões realizadas
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
              {mockPrestadorPerformance.avgSatisfaction}/10
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avaliação dos colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Colaboradores Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {mockPrestadorPerformance.totalClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total único de colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Taxa de Retenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {mockPrestadorPerformance.retentionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Colaboradores que voltaram
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolução de Sessões ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSessionEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="sessions" orientation="left" />
                <YAxis yAxisId="satisfaction" orientation="right" domain={[8, 10]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sessions' ? value : `${value}/10`,
                    name === 'sessions' ? 'Sessões completas' : 'Satisfação'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="sessions"
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  name="Sessões"
                />
                <Line 
                  yAxisId="satisfaction"
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  name="Satisfação"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Sessões realizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Satisfação média</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Análise Financeira Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-base">Mês</th>
                  <th className="text-right p-4 font-medium text-base">Sessões</th>
                  <th className="text-right p-4 font-medium text-base">Valor Bruto</th>
                  <th className="text-right p-4 font-medium text-base">Comissão (25%)</th>
                  <th className="text-right p-4 font-medium text-base">Total Líquido</th>
                </tr>
              </thead>
              <tbody>
                {mockFinancialData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium text-base">{item.month}</td>
                    <td className="p-4 text-right text-base">{item.sessions}</td>
                    <td className="p-4 text-right text-base">{item.grossValue.toLocaleString('pt-PT')} MZN</td>
                    <td className="p-4 text-right text-orange-600 text-base">
                      {item.commission.toLocaleString('pt-PT')} MZN
                    </td>
                    <td className="p-4 text-right text-green-600 font-semibold text-base">
                      {item.netValue.toLocaleString('pt-PT')} MZN
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/30">
                  <td className="p-4 font-bold text-base">Total</td>
                  <td className="p-4 text-right font-bold text-base">{totalSessions}</td>
                  <td className="p-4 text-right font-bold text-base">{totalGrossValue.toLocaleString('pt-PT')} MZN</td>
                  <td className="p-4 text-right font-bold text-orange-600 text-base">
                    {totalCommission.toLocaleString('pt-PT')} MZN
                  </td>
                  <td className="p-4 text-right font-bold text-green-600 text-base">
                    {totalNetValue.toLocaleString('pt-PT')} MZN
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bruto</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {totalGrossValue.toLocaleString('pt-PT')} MZN
                    </p>
                  </div>
                  <Euro className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Comissão Plataforma</p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                      {totalCommission.toLocaleString('pt-PT')} MZN
                    </p>
                  </div>
                  <Percent className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Líquido</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {totalNetValue.toLocaleString('pt-PT')} MZN
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-700">Pontos Fortes</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Alta satisfação dos colaboradores ({mockPrestadorPerformance.avgSatisfaction}/10)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Excelente taxa de retenção ({mockPrestadorPerformance.retentionRate}%)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Crescimento consistente de sessões
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-amber-700">Oportunidades</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Expandir para mais colaboradores únicos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Aumentar número de sessões por mês
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Diversificar tipos de sessões oferecidas
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrestadorPerformance;
