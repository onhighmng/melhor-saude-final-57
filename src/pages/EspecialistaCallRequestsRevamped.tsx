import React, { useState, useMemo } from 'react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  Clock, 
  AlertCircle, 
  User,
  Building2,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { CallModal } from '@/components/specialist/CallModal';
import { mockCallRequests, mockChatSessions } from '@/data/especialistaGeralMockData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const EspecialistaCallRequestsRevamped = () => {
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const pillarLabels: Record<string, string> = {
    psychological: 'Psicológico',
    financial: 'Financeiro',
    legal: 'Jurídico',
    physical: 'Físico',
  };

  // Categorizar chamadas por urgência
  const urgentCalls = useMemo(
    () => mockCallRequests.filter(req => req.status === 'pending' && req.wait_time > 180).sort((a, b) => b.wait_time - a.wait_time),
    []
  );

  const priorityCalls = useMemo(
    () => mockCallRequests.filter(req => req.status === 'pending' && req.wait_time >= 60 && req.wait_time <= 180).sort((a, b) => b.wait_time - a.wait_time),
    []
  );

  const recentCalls = useMemo(
    () => mockCallRequests.filter(req => req.status === 'pending' && req.wait_time < 60).sort((a, b) => b.wait_time - a.wait_time),
    []
  );

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime > 180) return 'text-red-600';
    if (waitTime >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleInitiateCall = (request: any) => {
    // Buscar histórico de chat se existir
    const chatHistory = mockChatSessions.find(chat => chat.id === request.chat_session_id);
    
    setSelectedCall({
      ...request,
      chat_history: chatHistory?.messages || []
    });
    setCallModalOpen(true);
  };

  const handleMarkResolved = (requestId: string) => {
    toast({
      title: 'Chamada Resolvida',
      description: 'O pedido foi marcado como resolvido.',
    });
  };

  const handleCallComplete = (result: any) => {
    console.log('Chamada completa:', result);
    // Aqui faria o update no backend
  };

  const renderCallCard = (request: any) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{request.user_name}</p>
              <p className="text-xs text-muted-foreground">{request.user_email}</p>
              <p className="text-xs text-muted-foreground font-mono">{request.user_phone}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {request.pillar ? pillarLabels[request.pillar] : 'Geral'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {request.company_name}
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${getWaitTimeColor(request.wait_time)}`} />
          <span className={`text-sm font-medium ${getWaitTimeColor(request.wait_time)}`}>
            Aguarda há {request.wait_time} min
          </span>
        </div>

        {request.notes && (
          <p className="text-xs text-muted-foreground border-l-2 border-blue-200 pl-2 italic">
            {request.notes}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => handleInitiateCall(request)}
          >
            <Phone className="h-4 w-4 mr-1" />
            Ligar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkResolved(request.id)}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Calcular estatísticas SLA
  const totalPending = mockCallRequests.filter(r => r.status === 'pending').length;
  const avgWaitTime = totalPending > 0
    ? Math.round(mockCallRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.wait_time, 0) / totalPending)
    : 0;
  const slaCompliance = Math.round(((totalPending - urgentCalls.length) / Math.max(totalPending, 1)) * 100);

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold">Pedidos de Chamada</h1>
        <p className="text-muted-foreground">
          Gerir pedidos de contacto telefónico dos colaboradores
        </p>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 min-h-0">
        <BentoGrid className="h-full" style={{ gridAutoRows: '1fr' }}>
          {/* Chamadas Urgentes */}
          <BentoCard
            name="🚨 Urgentes"
            description={`${urgentCalls.length} chamadas com >3h de espera`}
            Icon={AlertCircle}
            className="col-span-3 lg:col-span-1 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50" />
            }
            iconColor="text-red-600"
            textColor="text-gray-900"
            descriptionColor="text-red-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {urgentCalls.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Sem chamadas urgentes!
                      </p>
                    </div>
                  ) : (
                    urgentCalls.map(renderCallCard)
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>

          {/* Prioridade Normal */}
          <BentoCard
            name="⚠️ Prioridade"
            description={`${priorityCalls.length} chamadas entre 1-3h`}
            Icon={Clock}
            className="col-span-3 lg:col-span-1 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50" />
            }
            iconColor="text-orange-600"
            textColor="text-gray-900"
            descriptionColor="text-orange-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {priorityCalls.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Sem chamadas prioritárias
                      </p>
                    </div>
                  ) : (
                    priorityCalls.map(renderCallCard)
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>

          {/* Recentes */}
          <BentoCard
            name="✅ Recentes"
            description={`${recentCalls.length} chamadas com <1h`}
            Icon={Phone}
            className="col-span-3 lg:col-span-1 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
            }
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-green-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {recentCalls.length === 0 ? (
                    <div className="text-center py-8">
                      <Phone className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Sem chamadas recentes
                      </p>
                    </div>
                  ) : (
                    recentCalls.map(renderCallCard)
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>

          {/* Estatísticas SLA */}
          <BentoCard
            name="Estatísticas de SLA"
            description="Desempenho do tempo de resposta"
            Icon={TrendingUp}
            className="col-span-3 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
            }
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 relative z-20">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chamadas Pendentes</p>
                  <p className="text-3xl font-bold text-blue-600">{totalPending}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tempo Médio de Espera</p>
                  <p className="text-3xl font-bold text-orange-600">{avgWaitTime} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Conformidade SLA</p>
                  <p className="text-3xl font-bold text-green-600">{slaCompliance}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Meta: 95% {'<'}60 min</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>

      {/* Call Modal */}
      <CallModal
        open={callModalOpen}
        onOpenChange={setCallModalOpen}
        callRequest={selectedCall}
        onCallComplete={handleCallComplete}
      />
    </div>
  );
};

export default EspecialistaCallRequestsRevamped;
