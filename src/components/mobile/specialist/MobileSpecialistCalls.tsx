import { useEffect, useState } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface CallRequest {
  id: string;
  user_name: string;
  company: string;
  pillar: string;
  pillarLabel: string;
  statusColor: string;
  email: string;
  phone: string;
  notes: string;
  time_ago: string;
}

export function MobileSpecialistCalls() {
  const { escalatedChats, loading: chatsLoading } = useEscalatedChats();
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);

  useEffect(() => {
    const loadCallRequests = async () => {
      const requests: CallRequest[] = escalatedChats
        .filter(chat => chat.status === 'phone_escalated')
        .map(chat => ({
          id: chat.id,
          user_name: chat.user_name || 'Cliente',
          company: chat.company_name || 'Empresa',
          pillar: chat.pillar || 'saude_mental',
          pillarLabel: getPillarLabel(chat.pillar || 'saude_mental'),
          statusColor: getPillarColor(chat.pillar || 'saude_mental'),
          email: chat.user_email || 'email@exemplo.com',
          phone: '+351 91 000 0000',
          notes: chat.reason || 'Solicitação de ajuda',
          time_ago: getTimeAgo(chat.created_at || new Date().toISOString())
        }));

      setCallRequests(requests);
    };

    if (!chatsLoading) {
      loadCallRequests();
    }
  }, [escalatedChats, chatsLoading]);

  const getPillarLabel = (pillar: string): string => {
    const labels: Record<string, string> = {
      'saude_mental': 'Saúde Mental',
      'mental_health': 'Saúde Mental',
      'assistencia_financeira': 'Assistência Financeira',
      'financial': 'Assistência Financeira',
      'assistencia_juridica': 'Assistência Jurídica',
      'legal': 'Assistência Jurídica',
      'bem_estar_fisico': 'Bem-Estar Físico',
      'physical': 'Bem-Estar Físico'
    };
    return labels[pillar] || 'Saúde Mental';
  };

  const getPillarColor = (pillar: string): string => {
    const colors: Record<string, string> = {
      'saude_mental': 'bg-blue-100 text-blue-700',
      'mental_health': 'bg-blue-100 text-blue-700',
      'assistencia_financeira': 'bg-green-100 text-green-700',
      'financial': 'bg-green-100 text-green-700',
      'assistencia_juridica': 'bg-purple-100 text-purple-700',
      'legal': 'bg-purple-100 text-purple-700',
      'bem_estar_fisico': 'bg-yellow-100 text-yellow-700',
      'physical': 'bg-yellow-100 text-yellow-700'
    };
    return colors[pillar] || 'bg-blue-100 text-blue-700';
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `há ${diffMins} mins`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    }
  };

  const handleCall = (request: CallRequest) => {
    if (request.phone) {
      window.location.href = `tel:${request.phone}`;
    }
  };

  const handleResolve = async (request: CallRequest) => {
    try {
      await supabase
        .from('escalated_chats')
        .update({ status: 'resolved' })
        .eq('id', request.id);
      
      setCallRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error resolving request:', error);
    }
  };

  if (chatsLoading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar pedidos..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-center text-gray-900 text-xl font-semibold mb-1">
            Pedidos de Chamada
          </h1>
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
          <h2 className="text-gray-900 font-semibold">Pedidos de Chamada Pendentes</h2>
        </div>
        <p className="text-sm text-gray-600 -mt-2 mb-4">
          {callRequests.length} pedido{callRequests.length !== 1 ? 's' : ''} de chamada pendente{callRequests.length !== 1 ? 's' : ''}
        </p>

        {/* Call Request Cards */}
        {callRequests.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum pedido de chamada pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {callRequests.map((request) => (
              <div 
                key={request.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-medium">{request.user_name}</h3>
                    <p className="text-sm text-gray-600">{request.company}</p>
                  </div>
                  <Badge className={`${request.statusColor} border-0 rounded-full px-3 py-1`}>
                    {request.pillarLabel}
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
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 rounded-full"
                    onClick={() => handleCall(request)}
                  >
                    Ligar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-full border-gray-300"
                    onClick={() => handleResolve(request)}
                  >
                    Resolver
                  </Button>
                </div>

                {/* Time */}
                <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-gray-100">
                  <Clock className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600">
                    {request.time_ago}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}
