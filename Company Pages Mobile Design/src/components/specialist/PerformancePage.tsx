import { Download, Calendar, Users, Star, Euro, Percent, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export function PerformancePage() {
  const chartData = [
    { month: 'Nov', sessions: 12 },
    { month: 'Dez', sessions: 14 },
    { month: 'Jan', sessions: 15 },
    { month: 'Fev', sessions: 13 },
    { month: 'Mar', sessions: 16 },
    { month: 'Abr', sessions: 15 },
    { month: 'Mai', sessions: 17 },
    { month: 'Jun', sessions: 16 },
    { month: 'Jul', sessions: 14 },
    { month: 'Ago', sessions: 18 },
    { month: 'Set', sessions: 15 },
    { month: 'Out', sessions: 16 },
  ];

  const monthlyData = [
    { month: 'Mai', sessions: 15, gross: '5250 MZN', net: '3937,5 MZN' },
    { month: 'Jun', sessions: 18, gross: '6300 MZN', net: '4725 MZN' },
    { month: 'Jul', sessions: 21, gross: '7350 MZN', net: '5512,5 MZN' },
    { month: 'Ago', sessions: 20, gross: '7000 MZN', net: '5250 MZN' },
    { month: 'Set', sessions: 24, gross: '8400 MZN', net: '6300 MZN' },
    { month: 'Out', sessions: 19, gross: '6650 MZN', net: '4987,5 MZN' },
  ];

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-slate-900">Desempenho</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </button>
          </div>
          <p className="text-slate-600 text-sm">
            Métricas e análise financeira do seu desempenho
          </p>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
          <h2 className="text-slate-900 mb-4">Resumo de Desempenho</h2>
          <p className="text-slate-600 text-sm mb-6">
            Visão geral das suas métricas principais este mês
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div className="text-slate-600 text-xs">Sessões Este Mês</div>
              </div>
              <div className="text-slate-900">18</div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <div className="text-slate-600 text-xs">Colaboradores</div>
              </div>
              <div className="text-slate-900">24</div>
            </div>

            <div className="col-span-2 bg-amber-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-amber-600" />
                <div className="text-slate-600 text-xs">Satisfação Média</div>
              </div>
              <div className="text-slate-900">9.2/10</div>
            </div>
          </div>
        </div>

        {/* Evolution Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
          <h2 className="text-slate-900 mb-4">Evolução de Sessões</h2>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
          <h2 className="text-slate-900 mb-4">Resumo Financeiro</h2>

          <div className="space-y-3 mb-4">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-blue-600" />
                <div className="text-slate-600 text-xs">Total Bruto</div>
              </div>
              <div className="text-slate-900">49 950 MZN</div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-orange-600" />
                <div className="text-slate-600 text-xs">Comissão</div>
              </div>
              <div className="text-orange-700">10 237,5 MZN</div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <div className="text-slate-600 text-xs">Total Líquido</div>
              </div>
              <div className="text-emerald-700">39 712,5 MZN</div>
            </div>
          </div>
        </div>

        {/* Monthly Analysis */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
          <h2 className="text-slate-900 mb-2">Análise Mensal Detalhada</h2>
          <p className="text-slate-600 text-sm mb-4">
            Histórico de sessões e valores por mês
          </p>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-600 py-3 pr-4">Mês</th>
                  <th className="text-left text-slate-600 py-3 pr-4">Sessões</th>
                  <th className="text-left text-slate-600 py-3 pr-4">Valor Bruto</th>
                  <th className="text-left text-slate-600 py-3">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, index) => (
                  <tr key={index} className="border-b border-slate-50">
                    <td className="py-3 pr-4 text-slate-700">{row.month}</td>
                    <td className="py-3 pr-4 text-slate-700">{row.sessions}</td>
                    <td className="py-3 pr-4 text-slate-700">{row.gross}</td>
                    <td className="py-3 text-emerald-700">{row.net}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200">
                  <td className="py-3 pr-4 text-slate-900">Total</td>
                  <td className="py-3 pr-4 text-slate-900">117</td>
                  <td className="py-3 pr-4 text-slate-900">40 950 MZN</td>
                  <td className="py-3 text-emerald-700">30 712,5 MZN</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-slate-900">Insights de Desempenho</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Strengths */}
            <div>
              <h3 className="text-emerald-700 mb-3 text-sm">Pontos Fortes</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Alta satisfação dos colaboradores (9.2/10)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Excelente taxa de retenção (87%)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Crescimento consistente de sessões
                  </span>
                </li>
              </ul>
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-orange-700 mb-3 text-sm">Oportunidades</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Expandir para mais colaboradores nativos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Aumentar número de sessões por mês
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Diversificar tipos de sessões oferecidas
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
