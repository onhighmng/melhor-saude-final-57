import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PrestadorPerformanceFeaturesProps {
  performance: {
    sessionsThisMonth: number;
    avgSatisfaction: number;
    totalClients: number;
    retentionRate: number;
  };
  sessionEvolution: Array<{
    month: string;
    sessions: number;
    satisfaction: number;
  }>;
  financialData: Array<{
    month: string;
    sessions: number;
    grossValue: number;
    commission: number;
    netValue: number;
  }>;
  onExportReport: () => void;
  isExporting: boolean;
}

export function PrestadorPerformanceFeatures({
  performance,
  sessionEvolution,
  financialData,
  onExportReport,
  isExporting
}: PrestadorPerformanceFeaturesProps) {
  const totalGrossValue = financialData.reduce((sum, item) => sum + item.grossValue, 0);
  const totalCommission = financialData.reduce((sum, item) => sum + item.commission, 0);
  const totalNetValue = financialData.reduce((sum, item) => sum + item.netValue, 0);
  const totalSessions = financialData.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Desempenho</h1>
            <p className="text-muted-foreground mt-1">
              Métricas e análise financeira do seu desempenho
            </p>
          </div>
          
          <Button 
            onClick={onExportReport}
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
                Exportar Relatório
              </>
            )}
          </Button>
        </div>

        <div className="mx-auto grid gap-2 sm:grid-cols-5">
          {/* Performance Summary Card - Top Left */}
          <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
            <CardHeader>
              <div className="md:p-6">
                <p className="font-medium text-2xl">Resumo de Desempenho</p>
                <p className="text-muted-foreground mt-3 max-w-sm text-sm">Visão geral das suas métricas principais este mês</p>
              </div>
            </CardHeader>

            <div className="relative h-fit pl-6 md:pl-12">
              <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sessões Este Mês</p>
                        <p className="text-3xl font-bold">{performance.sessionsThisMonth}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-8 w-8 text-amber-600 fill-amber-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfação Média</p>
                        <p className="text-3xl font-bold">{performance.avgSatisfaction}/10</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Colaboradores</p>
                        <p className="text-3xl font-bold">{performance.totalClients}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                        <p className="text-3xl font-bold">{performance.retentionRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Evolution Chart - Top Right */}
          <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
            <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6">Evolução de Sessões</p>

            <CardContent className="mt-auto h-fit">
              <div className="relative mb-6 sm:mb-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionEvolution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="sessions" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'sessions' ? value : `${value}/10`,
                          name === 'sessions' ? 'Sessões' : 'Satisfação'
                        ]}
                      />
                      <Line 
                        yAxisId="sessions"
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary - Bottom Left */}
          <Card className="group p-6 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12">
            <p className="mx-auto mb-8 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl">Resumo Financeiro</p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Euro className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bruto</p>
                    <p className="text-xl font-bold">{totalGrossValue.toLocaleString('pt-PT')} MZN</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Percent className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Comissão</p>
                    <p className="text-xl font-bold text-orange-600">{totalCommission.toLocaleString('pt-PT')} MZN</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Líquido</p>
                    <p className="text-xl font-bold text-green-600">{totalNetValue.toLocaleString('pt-PT')} MZN</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Table - Bottom Right */}
          <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
            <CardHeader className="p-6 md:p-12">
              <p className="font-medium text-xl">Análise Mensal Detalhada</p>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">Histórico de sessões e valores por mês</p>
            </CardHeader>
            <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Mês</th>
                      <th className="text-right p-2 font-medium">Sessões</th>
                      <th className="text-right p-2 font-medium">Valor Bruto</th>
                      <th className="text-right p-2 font-medium">Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.slice(-6).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{item.month}</td>
                        <td className="p-2 text-right">{item.sessions}</td>
                        <td className="p-2 text-right">{item.grossValue.toLocaleString('pt-PT')} MZN</td>
                        <td className="p-2 text-right text-green-600 font-semibold">
                          {item.netValue.toLocaleString('pt-PT')} MZN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/30">
                      <td className="p-2 font-bold">Total</td>
                      <td className="p-2 text-right font-bold">{totalSessions}</td>
                      <td className="p-2 text-right font-bold">{totalGrossValue.toLocaleString('pt-PT')} MZN</td>
                      <td className="p-2 text-right font-bold text-green-600">
                        {totalNetValue.toLocaleString('pt-PT')} MZN
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights - Full Width Bottom */}
        <Card className="mt-2 shadow-black/5">
          <CardHeader className="p-6 md:p-12">
            <p className="font-medium text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Insights de Desempenho
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6 md:px-12 md:pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700">Pontos Fortes</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Alta satisfação dos colaboradores ({performance.avgSatisfaction}/10)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Excelente taxa de retenção ({performance.retentionRate}%)
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
    </section>
  );
}
