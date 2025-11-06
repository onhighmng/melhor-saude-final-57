import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Star, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function MobileSpecialistStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = {
    totalSessions: 45,
    activeClients: 28,
    averageRating: 4.8,
    totalHours: 67,
    completionRate: 92,
    responseTime: '2.5h'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Estatísticas</h1>
          <p className="text-gray-500 text-sm">Desempenho e métricas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'year' && 'Ano'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none">
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
            <p className="text-xs text-gray-600">Sessões</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none">
            <Users className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.activeClients}</p>
            <p className="text-xs text-gray-600">Clientes Ativos</p>
          </Card>
          <Card className="bg-yellow-50 rounded-2xl p-4 border-none">
            <Star className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
            <p className="text-xs text-gray-600">Avaliação Média</p>
          </Card>
          <Card className="bg-purple-50 rounded-2xl p-4 border-none">
            <Clock className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{stats.totalHours}h</p>
            <p className="text-xs text-gray-600">Horas Totais</p>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-white rounded-2xl p-5 border border-gray-200 mb-3">
          <h3 className="text-gray-900 font-semibold mb-4">Desempenho</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                <span className="text-sm font-medium text-gray-900">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Tempo Médio de Resposta</span>
                <span className="text-sm font-medium text-gray-900">{stats.responseTime}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

