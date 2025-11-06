import React from 'react';
import { Phone, Clock, Mail } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function DesktopCalls() {
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Pedidos de Chamada</h1>
        <p className="text-gray-600">
          Gerir solicitações de chamada dos utilizadores das empresas atribuídas
        </p>
      </div>

      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-5 h-5" />
          <h2>Pedidos de Chamada Pendentes</h2>
        </div>
        <p className="text-sm text-gray-600">15 pedidos de chamada pendentes</p>
      </div>

      {/* Call Requests List */}
      <div className="space-y-4">
        {callRequests.map((request, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-1">{request.name}</h3>
                <p className="text-sm text-gray-600">{request.company}</p>
              </div>
              <Badge className={`${request.statusColor} border-0 px-3 py-1`}>
                {request.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{request.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{request.phone}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm">
                <span className="text-gray-500">Notas:</span> {request.notes}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${request.timeColor}`} />
                <span className={`text-sm ${request.timeColor}`}>
                  {request.time}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-green-600 hover:bg-green-700 px-6">
                  Ligar
                </Button>
                <Button variant="outline" className="px-6">
                  Resolver
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
