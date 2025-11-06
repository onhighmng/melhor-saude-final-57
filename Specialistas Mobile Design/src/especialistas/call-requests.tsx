import React, { useState } from 'react';
import { Phone, Calendar, TrendingUp, User, Clock, Mail, ChevronLeft, Users, BarChart3, Settings } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface CallRequestsProps {
  onNavigate: (view: 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings') => void;
}

export default function CallRequests({ onNavigate }: CallRequestsProps) {
  const [selectedTab, setSelectedTab] = useState('pending');

  const callRequests = [
    {
      name: 'Ana Silva',
      company: 'Empresa Exemplo Lda',
      status: 'Saúde Mental',
      statusColor: 'bg-blue-100 text-blue-700',
      email: 'ana.silva@empresa.co.net',
      phone: '+351 93 521 4578',
      notes: 'Solicitação de ajuda com caso novo trabalhador',
      time: 'há 5 mins',
      timeColor: 'text-orange-600'
    },
    {
      name: 'Carlos Santos',
      company: 'Tech Solutions MG',
      status: 'Assistência Financeira',
      statusColor: 'bg-green-100 text-green-700',
      email: 'carlos.santos@tech.co.net',
      phone: '+351 92 524 1054',
      notes: 'Problemas financeiros pessoal, precisa de orientação',
      time: 'há 12 mins',
      timeColor: 'text-orange-600'
    },
    {
      name: 'Maria Costa',
      company: 'Empresa Exemplo Lda',
      status: 'Assistência Jurídica',
      statusColor: 'bg-purple-100 text-purple-700',
      email: 'maria.costa@empresa.co.net',
      phone: '+351 93 542 5782',
      notes: 'Questão sobre contrato de trabalho',
      time: 'há 18 mins',
      timeColor: 'text-orange-600'
    },
    {
      name: 'João Ferreira',
      company: 'Empresa Exemplo Lda',
      status: 'Bem-Estar Físico',
      statusColor: 'bg-yellow-100 text-yellow-700',
      email: 'joao.ferreira@empresa.co.net',
      phone: '+351 94 548 7849',
      notes: 'Dores em certa circunstâncias no trabalho recente',
      time: 'há 25 mins',
      timeColor: 'text-orange-600'
    },
    {
      name: 'Sofia Rodrigues',
      company: 'Tech Solutions MG',
      status: 'Saúde Mental',
      statusColor: 'bg-blue-100 text-blue-700',
      email: 'sofia.rodrigues@tech.co.net',
      phone: '+351 93 782 8941',
      notes: 'Ansiedade relacionada à pressa de projetos',
      time: 'há 32 mins',
      timeColor: 'text-orange-600'
    },
    {
      name: 'Pedro Mendes',
      company: 'Empresa Exemplo Lda',
      status: 'Assistência Financeira',
      statusColor: 'bg-green-100 text-green-700',
      email: 'pedro.mendes@empresa.co.net',
      phone: '+351 91 639 8211',
      notes: 'Planejamento financeiro pós aumento salarial',
      time: 'há 45 mins',
      timeColor: 'text-orange-600'
    },
    {
      name: 'Ricardo Almeida',
      company: 'Tech Solutions MG',
      status: 'Bem-Estar Físico',
      statusColor: 'bg-yellow-100 text-yellow-700',
      email: 'ricardo.almeida@tech.co.net',
      phone: '+351 92 847 5623',
      notes: 'Precisa orientação sobre ergonomia',
      time: 'há 52 mins',
      timeColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-2">
            <button className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            <h1 className="text-center flex-1">Pedidos de Chamada</h1>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Gerir solicitações de chamada dos utilizadores das empresas atribuídas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 pb-24">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-gray-700" />
          <h2>Pedidos de Chamada Pendentes</h2>
        </div>
        <p className="text-sm text-gray-600 -mt-2 mb-4">
          15 pedidos de chamada pendentes
        </p>

        {/* Call Request Cards */}
        <div className="space-y-3">
          {callRequests.map((request, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3>{request.name}</h3>
                  <p className="text-sm text-gray-600">{request.company}</p>
                </div>
                <Badge className={`${request.statusColor} border-0 rounded-full px-3 py-1`}>
                  {request.status}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{request.phone}</span>
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  <span className="text-gray-500">Notas:</span> {request.notes}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 rounded-full">
                  Ligar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-full border-gray-300"
                >
                  Resolver
                </Button>
              </div>

              {/* Time */}
              <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-gray-100">
                <Clock className={`w-3 h-3 ${request.timeColor}`} />
                <span className={`text-xs ${request.timeColor}`}>
                  {request.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* iOS-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-6 px-2 py-2">
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('dashboard')}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-blue-600">
            <Phone className="w-5 h-5" />
            <span className="text-xs">Chamadas</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('sessions')}>
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Sessões</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('history')}>
            <Users className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('stats')}>
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Stats</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('settings')}>
            <Settings className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}