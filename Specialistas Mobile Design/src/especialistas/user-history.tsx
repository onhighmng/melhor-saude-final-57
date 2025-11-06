import React from 'react';
import { Phone, Calendar, TrendingUp, User, ChevronLeft, Eye, Users, BarChart3, Settings } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface UserHistoryProps {
  onNavigate: (view: 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings') => void;
}

export default function UserHistory({ onNavigate }: UserHistoryProps) {
  const users = [
    {
      name: 'Ana Silva',
      company: 'Empresa Exemplo Lda',
      plan: 'Saúde Mental',
      planColor: 'bg-blue-100 text-blue-700',
      date: '04/04/25',
      rating: '4.5/5',
      ratingColor: 'text-yellow-600',
      notes: 'Usuário demonstrou alta ansiedade no trabalho. Recomendo sessões regulares.'
    },
    {
      name: 'Carlos Santos',
      company: 'Tech Solutions MG',
      plan: 'Assistência Financeira',
      planColor: 'bg-green-100 text-green-700',
      date: '01/04/25',
      rating: '5/5',
      ratingColor: 'text-yellow-600',
      notes: 'Usuário está passando por dificuldades financeiras atuais. Precisa de aconselhamento.'
    },
    {
      name: 'Maria Costa',
      company: 'Empresa Exemplo Lda',
      plan: 'Assistência Jurídica',
      planColor: 'bg-purple-100 text-purple-700',
      date: '01/04/25',
      rating: '4/5',
      ratingColor: 'text-yellow-600',
      notes: 'Pedido legal resolvido com sucesso. Usuária satisfeita com o atendimento.'
    },
    {
      name: 'João Ferreira',
      company: 'Empresa Exemplo Lda',
      plan: 'Bem-Estar Físico',
      planColor: 'bg-yellow-100 text-yellow-700',
      date: '04/04/25',
      rating: '4.5/5',
      ratingColor: 'text-yellow-600',
      notes: 'Problema físico relacionado ao trabalho remoto. Retalé de fisioterapia recomendada.'
    },
    {
      name: 'Sofia Rodrigues',
      company: 'Tech Solutions MG',
      plan: 'Saúde Mental',
      planColor: 'bg-blue-100 text-blue-700',
      date: '01/04/25',
      rating: '4.5/5',
      ratingColor: 'text-yellow-600',
      notes: 'Caso de burnout em recuperação. Escalonar progresso nos últimos sessões.'
    },
    {
      name: 'Pedro Mendes',
      company: 'Empresa Exemplo Lda',
      plan: 'Assistência Financeira',
      planColor: 'bg-green-100 text-green-700',
      date: '07/04/25',
      rating: '5/5',
      ratingColor: 'text-yellow-600',
      notes: 'Usuário implementou plano de progresso. Acompanhar progresso mensalmente.'
    }
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
            <h1 className="text-center flex-1">Histórial de Utilizadores</h1>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Lista de utilizadores já atendidos com histórico completo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 pb-24">
        {users.map((user, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
          >
            {/* User Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.company}</p>
              </div>
              <Badge className={`${user.planColor} border-0 rounded-full px-3 py-1`}>
                {user.plan}
              </Badge>
            </div>

            {/* Date and Rating */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="text-gray-600">{user.date}</span>
              <span className={user.ratingColor}>★ {user.rating}</span>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <p className="text-sm text-gray-700">{user.notes}</p>
            </div>

            {/* Action Button */}
            <Button 
              variant="outline" 
              className="w-full rounded-full border-gray-300 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver mais ancestar
            </Button>
          </div>
        ))}
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
            className="flex flex-col items-center gap-1 py-2 text-blue-600"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </button>
          <button 
            onClick={() => onNavigate('stats')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
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