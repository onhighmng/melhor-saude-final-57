import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Star, 
  Monitor, 
  MapPin, 
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function AdminReports() {
  const timePeriods = ['Hoje', '7 dias', '30 dias', '90 dias'];
  const selectedPeriod = '30 dias';

  const keyMetrics = [
    {
      id: 1,
      label: 'Sessões Totais',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'blue',
    },
    {
      id: 2,
      label: 'Taxa de Conclusão',
      value: '94%',
      change: '+3%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'green',
    },
    {
      id: 3,
      label: 'Colaboradores Ativos',
      value: '156',
      change: '+8',
      trend: 'up',
      icon: Users,
      color: 'purple',
    },
    {
      id: 4,
      label: 'Avaliação Média',
      value: '8.7',
      change: '+0.3',
      trend: 'up',
      icon: Star,
      color: 'yellow',
    },
  ];

  const sessionBreakdown = [
    {
      type: 'Virtual',
      count: 168,
      percentage: 68,
      icon: Monitor,
      color: 'blue',
    },
    {
      type: 'Presencial',
      count: 80,
      percentage: 32,
      icon: MapPin,
      color: 'green',
    },
  ];

  const statusBreakdown = [
    {
      status: 'Concluído',
      count: 233,
      percentage: 94,
      color: 'green',
      icon: CheckCircle2,
    },
    {
      status: 'Cancelado',
      count: 10,
      percentage: 4,
      color: 'red',
      icon: XCircle,
    },
    {
      status: 'Agendado',
      count: 5,
      percentage: 2,
      color: 'blue',
      icon: Clock,
    },
  ];

  const topPerformers = [
    {
      id: 1,
      name: 'Maria Santos',
      sessions: 42,
      rating: 9.2,
      initials: 'MS',
    },
    {
      id: 2,
      name: 'João Silva',
      sessions: 38,
      rating: 8.9,
      initials: 'JS',
    },
    {
      id: 3,
      name: 'Ana Costa',
      sessions: 35,
      rating: 8.8,
      initials: 'AC',
    },
  ];

  const weeklyActivity = [
    { day: 'Seg', sessions: 42 },
    { day: 'Ter', sessions: 38 },
    { day: 'Qua', sessions: 45 },
    { day: 'Qui', sessions: 52 },
    { day: 'Sex', sessions: 48 },
    { day: 'Sáb', sessions: 15 },
    { day: 'Dom', sessions: 8 },
  ];

  const maxSessions = Math.max(...weeklyActivity.map(d => d.sessions));

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Relatórios</h1>
        <p className="text-sm text-gray-500">Estatísticas e análises detalhadas</p>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {timePeriods.map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  metric.color === 'blue'
                    ? 'bg-blue-100'
                    : metric.color === 'green'
                    ? 'bg-green-100'
                    : metric.color === 'purple'
                    ? 'bg-purple-100'
                    : 'bg-yellow-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    metric.color === 'blue'
                      ? 'text-blue-600'
                      : metric.color === 'green'
                      ? 'text-green-600'
                      : metric.color === 'purple'
                      ? 'text-purple-600'
                      : 'text-yellow-600'
                  }`}
                />
              </div>
              <p className="text-2xl text-gray-900 mb-1">{metric.value}</p>
              <p className="text-xs text-gray-500 mb-2">{metric.label}</p>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span
                  className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-gray-900 mb-4">Atividade Semanal</h3>
        <div className="flex items-end justify-between gap-2 h-32 mb-2">
          {weeklyActivity.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" 
                   style={{ height: `${(day.sessions / maxSessions) * 100}%`, minHeight: '8px' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-purple-500" />
              </div>
              <span className="text-xs text-gray-500">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          {weeklyActivity.reduce((sum, d) => sum + d.sessions, 0)} sessões no total
        </div>
      </div>

      {/* Session Type Breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-gray-900 mb-4">Tipos de Sessão</h3>
        <div className="space-y-3">
          {sessionBreakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          item.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-900">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.color === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                        : 'bg-gradient-to-r from-green-500 to-green-400'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-gray-900 mb-4">Estado das Sessões</h3>
        <div className="space-y-3">
          {statusBreakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      item.color === 'green'
                        ? 'text-green-600'
                        : item.color === 'red'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <span className="text-sm text-gray-900">{item.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={`rounded-full text-xs ${
                      item.color === 'green'
                        ? 'bg-green-100 text-green-700'
                        : item.color === 'red'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.percentage}%
                  </Badge>
                  <span className="text-sm text-gray-900 w-8 text-right">{item.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 shadow-sm border border-purple-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">Top Prestadores</h3>
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={performer.id}
              className="flex items-center gap-3 bg-white/70 rounded-xl p-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs shrink-0">
                {performer.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{performer.name}</p>
                <p className="text-xs text-gray-500">{performer.sessions} sessões</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-900">{performer.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">Taxa de Sucesso</span>
          </div>
          <p className="text-2xl text-gray-900">94%</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-gray-600">Satisfação</span>
          </div>
          <p className="text-2xl text-gray-900">8.7/10</p>
        </div>
      </div>
    </div>
  );
}
