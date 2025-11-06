import { Calendar, Users, Star, Download, Euro, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export function Performance() {
  const sessionData = [
    { month: 'Jan', sessions: 42 },
    { month: 'Feb', sessions: 45 },
    { month: 'Mar', sessions: 52 },
    { month: 'Apr', sessions: 48 },
    { month: 'May', sessions: 58 },
    { month: 'Jun', sessions: 52 },
    { month: 'Jul', sessions: 62 },
  ];

  const monthlyData = [
    { month: 'Mai', sessions: 15, value: '5450 MZN', liquid: '31724 MZN' },
    { month: 'Jun', sessions: 18, value: '6450 MZN', liquid: '4715 MZN' },
    { month: 'Jul', sessions: 21, value: '7700 MZN', liquid: '7175 MZN' },
    { month: 'Ago', sessions: 30, value: '9000 MZN', liquid: '5250 MZN' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl mb-1">Desempenho</h1>
            <p className="text-gray-500 text-sm">Métricas e análise financeira do seu desempenho</p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full text-sm">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Performance Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="mb-1">Resumo de Desempenho</h3>
          <p className="text-sm text-gray-500">Visão geral das suas métricas principais este mês</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Sessions This Month */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Sessões Este Mês</div>
              <div className="text-2xl">18</div>
            </div>
          </div>

          {/* Collaborators */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Colaboradores</div>
              <div className="text-2xl">24</div>
            </div>
          </div>
        </div>

        {/* Average Satisfaction */}
        <div className="flex items-start gap-3 mt-6 pt-6 border-t border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Satisfação Média</div>
            <div className="text-2xl">9.2/10</div>
          </div>
        </div>
      </div>

      {/* Sessions Evolution Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="mb-1">Evolução de Sessões</h3>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="mb-1">Resumo Financeiro</h3>
        </div>

        <div className="space-y-4">
          {/* Total Gross */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Bruto</div>
              <div className="text-xl">49 950 MZN</div>
            </div>
          </div>

          {/* Commission */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Comissão</div>
              <div className="text-xl text-orange-600">10 337,5 MZN</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Total Líquido</div>
          <div className="text-2xl text-green-600">39 612,5 MZN</div>
        </div>
      </div>

      {/* Detailed Monthly Analysis */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="mb-1">Análise Mensal Detalhada</h3>
          <p className="text-sm text-gray-500">Histórico de sessões e valores por mês</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs text-gray-500">Mês</th>
                <th className="text-center py-3 text-xs text-gray-500">Sessões</th>
                <th className="text-right py-3 text-xs text-gray-500">Valor Bruto</th>
                <th className="text-right py-3 text-xs text-gray-500">Líquido</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-3 text-sm">{row.month}</td>
                  <td className="py-3 text-sm text-center">{row.sessions}</td>
                  <td className="py-3 text-sm text-right">{row.value}</td>
                  <td className="py-3 text-sm text-right text-green-600">{row.liquid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}