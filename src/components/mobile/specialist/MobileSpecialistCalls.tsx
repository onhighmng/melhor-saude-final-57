import { useState } from 'react';
import { Phone, User, Clock, Video, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CallRequest {
  id: string;
  user_name: string;
  company: string;
  pillar: string;
  time_ago: string;
  status: 'pending' | 'accepted' | 'completed';
}

export function MobileSpecialistCalls() {
  const [activeTab, setActiveTab] = useState('pending');

  const callRequests: CallRequest[] = [
    {
      id: '1',
      user_name: 'Ana Silva',
      company: 'Empresa Exemplo Lda',
      pillar: 'Saúde Mental',
      time_ago: 'há 5 mins',
      status: 'pending'
    },
    {
      id: '2',
      user_name: 'Carlos Santos',
      company: 'Tech Solutions MG',
      pillar: 'Bem-Estar Físico',
      time_ago: 'há 12 mins',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Pedidos de Chamada</h1>
          <p className="text-gray-500 text-sm">Gerir solicitações de chamadas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-orange-50 rounded-2xl p-4 border-none text-center">
            <Phone className="w-5 h-5 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{callRequests.length}</p>
            <p className="text-xs text-gray-600">Pendentes</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none text-center">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-xs text-gray-600">Hoje</p>
          </Card>
          <Card className="bg-blue-50 rounded-2xl p-4 border-none text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">2.5h</p>
            <p className="text-xs text-gray-600">Tempo Total</p>
          </Card>
        </div>

        {/* Call Requests List */}
        <div className="space-y-3">
          {callRequests.map((request) => (
            <Card 
              key={request.id}
              className="bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{request.user_name}</h3>
                  <p className="text-gray-500 text-sm">{request.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs">{request.pillar}</Badge>
                    <span className="text-xs text-gray-500">{request.time_ago}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Aceitar
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Online
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {callRequests.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum pedido de chamada pendente</p>
          </div>
        )}
      </div>
    </div>
  );
}

