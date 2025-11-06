import React from 'react';
import { Phone, Calendar, TrendingUp, User, ChevronRight, Clock, Users, BarChart3, Settings } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings') => void;
}

export default function EspecialistaDashboard({ onNavigate }: DashboardProps) {
  const callRequests = [
    {
      name: 'Ana Silva',
      company: 'Empresa Exemplo Lda',
      time: 'há 5 mins'
    },
    {
      name: 'Carlos Santos',
      company: 'Tech Solutions MG',
      time: 'há 12 mins'
    },
    {
      name: 'Maria Costa',
      company: 'Empresa Exemplo Lda',
      time: 'há 18 mins'
    }
  ];

  const scheduledSessions = [
    {
      name: 'João Ferreira',
      time: '10:00',
      type: 'Individual'
    },
    {
      name: 'Sofia Rodrigues',
      time: '14:00',
      type: 'Individual'
    },
    {
      name: 'Ana Silva',
      time: '16:00',
      type: 'Individual'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-center">Dashboard</h1>
          <p className="text-center text-gray-500 text-sm mt-1">
            Profissional de Permanência
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Pending Calls Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>Chamadas Pendentes</h2>
              <p className="text-sm text-gray-600">15 chamadas aguardam ligação</p>
            </div>
          </div>
        </div>

        {/* Today's Sessions Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>Sessões Hoje</h2>
              <p className="text-sm text-gray-600">4 sessões agendadas para hoje</p>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" 
            alt="Sessions" 
            className="w-full h-32 object-cover rounded-xl"
          />
        </div>

        {/* General Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h2>Visão Geral</h2>
            <p className="text-sm text-gray-600">Atividade recente e métricas principais</p>
          </div>

          {/* Call Requests Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-red-500" />
              <h3 className="text-sm">Pedidos de Chamada</h3>
            </div>
            {callRequests.map((request, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm">{request.name}</p>
                    <p className="text-xs text-gray-600">{request.company}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{request.time}</span>
              </div>
            ))}
            <button className="w-full text-sm text-purple-600 mt-3" onClick={() => onNavigate('history')}>
              Ver Estatísticas Completas →
            </button>
          </div>

          {/* Scheduled Sessions Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm">Sessões Agendadas</h3>
            </div>
            {scheduledSessions.map((session, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm">{session.name}</p>
                    <p className="text-xs text-gray-600">{session.time} - {session.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Performance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm">
          <button 
            onClick={() => onNavigate('stats')}
            className="w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2>Desempenho Pessoal</h2>
                <p className="text-sm text-gray-600">42 casos este mês</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* iOS-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-6 px-2 py-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1 py-2 text-blue-600"
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