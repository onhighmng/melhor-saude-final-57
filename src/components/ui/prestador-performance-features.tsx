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
            <h1 className="text-5xl font-bold text-foreground">Desempenho</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Métricas e análise financeira do seu desempenho
            </p>
          </div>
          
          <Button 
            onClick={onExportReport}
            disabled={isExporting}
            size="lg"
            className="gap-3 text-lg px-8 py-6"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-6 w-6" />
                Exportar Relatório
              </>
            )}
          </Button>
        </div>

        <div className="mx-auto grid gap-2 sm:grid-cols-5">
          {/* Performance Summary Card - Top Left */}
          <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl">
            <CardHeader>
              <div className="md:p-8">
                <p className="font-medium text-3xl">Resumo de Desempenho</p>
                <p className="text-muted-foreground mt-4 max-w-sm text-base">Visão geral das suas métricas principais este mês</p>
              </div>
            </CardHeader>

            <div className="relative h-fit pl-6 md:pl-12">
              <div className="bg-background overflow-hidden rounded-tr-lg border-r border-t pr-2 pt-2 dark:bg-zinc-950">
                <div className="p-8 grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-12 w-12 text-blue-600" />
                      <div>
                        <p className="text-base text-muted-foreground">Sessões Este Mês</p>
                        <p className="text-5xl font-bold">{performance.sessionsThisMonth}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Star className="h-12 w-12 text-amber-600 fill-amber-600" />
                      <div>
                        <p className="text-base text-muted-foreground">Satisfação Média</p>
                        <p className="text-5xl font-bold">{performance.avgSatisfaction}/10</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-12 w-12 text-green-600" />
                      <div>
                        <p className="text-base text-muted-foreground">Colaboradores</p>
                        <p className="text-5xl font-bold">{performance.totalClients}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Evolution Chart - Top Right */}
          <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl">
            <p className="mx-auto my-8 max-w-md text-balance px-6 text-center text-2xl font-semibold sm:text-3xl md:p-8">Evolução de Sessões</p>

            <CardContent className="mt-auto h-fit">
              <div className="relative mb-6 sm:mb-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionEvolution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                      <YAxis yAxisId="sessions" tick={{ fontSize: 14 }} />
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
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary - Bottom Left */}
          <Card className="group p-8 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-16">
            <p className="mx-auto mb-10 max-w-md text-balance text-center text-2xl font-semibold sm:text-3xl">Resumo Financeiro</p>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Euro className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="text-base text-muted-foreground">Total Bruto</p>
                    <p className="text-3xl font-bold">{totalGrossValue.toLocaleString('pt-PT')} MZN</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Percent className="h-10 w-10 text-orange-600" />
                  <div>
                    <p className="text-base text-muted-foreground">Comissão</p>
                    <p className="text-3xl font-bold text-orange-600">{totalCommission.toLocaleString('pt-PT')} MZN</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="text-base text-muted-foreground">Total Líquido</p>
                    <p className="text-3xl font-bold text-green-600">{totalNetValue.toLocaleString('pt-PT')} MZN</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Table - Bottom Right */}
          <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl">
            <CardHeader className="p-8 md:p-16">
              <p className="font-medium text-3xl">Análise Mensal Detalhada</p>
              <p className="text-muted-foreground mt-3 max-w-sm text-base">Histórico de sessões e valores por mês</p>
            </CardHeader>
            <CardContent className="relative h-fit px-8 pb-8 md:px-16 md:pb-16">
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-4 font-semibold text-lg">Mês</th>
                      <th className="text-right p-4 font-semibold text-lg">Sessões</th>
                      <th className="text-right p-4 font-semibold text-lg">Valor Bruto</th>
                      <th className="text-right p-4 font-semibold text-lg">Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.slice(-6).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="p-4 font-medium text-base">{item.month}</td>
                        <td className="p-4 text-right text-base">{item.sessions}</td>
                        <td className="p-4 text-right text-base">{item.grossValue.toLocaleString('pt-PT')} MZN</td>
                        <td className="p-4 text-right text-green-600 font-semibold text-base">
                          {item.netValue.toLocaleString('pt-PT')} MZN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/30">
                      <td className="p-4 font-bold text-lg">Total</td>
                      <td className="p-4 text-right font-bold text-lg">{totalSessions}</td>
                      <td className="p-4 text-right font-bold text-lg">{totalGrossValue.toLocaleString('pt-PT')} MZN</td>
                      <td className="p-4 text-right font-bold text-green-600 text-lg">
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
          <CardHeader className="p-8 md:p-16">
            <p className="font-medium text-3xl flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              Insights de Desempenho
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8 md:px-16 md:pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="font-semibold text-green-700 text-2xl">Pontos Fortes</h4>
                <ul className="space-y-4 text-base">
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Alta satisfação dos colaboradores ({performance.avgSatisfaction}/10)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Excelente taxa de retenção ({performance.retentionRate}%)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Crescimento consistente de sessões
                  </li>
                </ul>
              </div>
              
              <div className="space-y-6">
                <h4 className="font-semibold text-amber-700 text-2xl">Oportunidades</h4>
                <ul className="space-y-4 text-base">
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    Expandir para mais colaboradores únicos
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    Aumentar número de sessões por mês
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
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
