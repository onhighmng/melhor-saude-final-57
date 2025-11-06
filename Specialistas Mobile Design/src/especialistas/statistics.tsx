import React from 'react';
import { Phone, Calendar, TrendingUp, User, ChevronLeft, Brain, DollarSign, Scale, Heart, ArrowUp, Users, BarChart3, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatisticsProps {
  onNavigate: (view: 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings') => void;
}

export default function Statistics({ onNavigate }: StatisticsProps) {
  const chartData = [
    { month: 'Jan', value: 35 },
    { month: 'Fev', value: 42 },
    { month: 'Mar', value: 45 },
    { month: 'Abr', value: 50 }
  ];

  const categories = [
    { name: 'Saúde Mental', cases: 32, icon: Brain, color: 'bg-blue-500' },
    { name: 'Assistência Financeira', cases: 18, icon: DollarSign, color: 'bg-green-500' },
    { name: 'Assistência Jurídica', cases: 8, icon: Scale, color: 'bg-purple-500' },
    { name: 'Bem-Estar Físico', cases: 12, icon: Heart, color: 'bg-yellow-500' }
  ];

  const recentCases = [
    { name: 'Ana Silva', rating: '4.5/5', note: 'Resolveu sua situação muito profissional e atenciosa.' },
    { name: 'Carlos Santos', rating: '5/5', note: 'Ajudou com horários, necessidade.' },
    { name: 'Maria Costa', rating: '4/5', note: 'Ótimo! Resolveu o meu problema rapidamente.' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-2">
            <button className="p-2 -ml-2" onClick={() => onNavigate('dashboard')}>
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            <h1 className="text-center flex-1">Estatísticas Pessoais</h1>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Acompanhe o seu desempenho e métricas de atendimento
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="mb-1">Resolução Interna</h2>
              <p className="text-sm text-gray-600">Taxa de casos resolvidos</p>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+8%</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">68%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-sm">
          <h2 className="mb-1">Encaminhamentos</h2>
          <p className="text-sm text-gray-600 mb-4">Casos redirecionados</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">32%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '32%' }}></div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4">Crescimento de séries em 4 meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4">Categorias de Atendimento</h3>
          <div className="space-y-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{category.cases} casos</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4">Feedbacks Recentes</h3>
          <div className="space-y-3">
            {recentCases.map((item, index) => (
              <div key={index} className="p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-yellow-600">★ {item.rating}</span>
                </div>
                <p className="text-xs text-gray-600 italic">"{item.note}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* iOS-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-6 px-2 py-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button 
            onClick={() => onNavigate('calls')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Chamadas</span>
          </button>
          <button 
            onClick={() => onNavigate('sessions')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Sessões</span>
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </button>
          <button 
            onClick={() => onNavigate('stats')}
            className="flex flex-col items-center gap-1 py-2 text-blue-600"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Stats</span>
          </button>
          <button 
            onClick={() => onNavigate('settings')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}