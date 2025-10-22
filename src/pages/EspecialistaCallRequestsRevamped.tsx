import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCallRequests, mockChatSessions } from '@/data/especialistaGeralMockData';
import { CallRequest } from '@/types/specialist';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { CallModal } from '@/components/specialist/CallModal';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const EspecialistaCallRequestsRevamped = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedRequest, setSelectedRequest] = useState<CallRequest | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Filter and categorize requests
  const allRequests = filterByCompanyAccess(mockCallRequests);
  const urgentRequests = allRequests.filter(req => req.status === 'pending' && req.wait_time > 180); // >3h
  const priorityRequests = allRequests.filter(req => req.status === 'pending' && req.wait_time >= 60 && req.wait_time <= 180); // 1-3h
  const recentRequests = allRequests.filter(req => req.status === 'pending' && req.wait_time < 60); // <1h

  const handleCallClick = (request: CallRequest) => {
    setSelectedRequest(request);
    setIsCallModalOpen(true);
  };

  const handleCallComplete = (outcome: string, notes: string) => {
    toast({
      title: 'Chamada Finalizada',
      description: `Resultado: ${outcome}. Notas guardadas com sucesso.`,
    });
    setIsCallModalOpen(false);
  };

  const getPillarLabel = (pillar: string | null) => {
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || 'Não definido';
  };

  const getPillarColor = (pillar: string | null) => {
    const colors = {
      psychological: 'bg-blue-100 text-blue-700',
      physical: 'bg-green-100 text-green-700',
      financial: 'bg-purple-100 text-purple-700',
      legal: 'bg-orange-100 text-orange-700'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const renderRequestCard = (request: CallRequest) => (
    <Card
      key={request.id}
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleCallClick(request)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{request.user_name}</h4>
            <p className="text-xs text-muted-foreground">{request.company_name}</p>
          </div>
          <Badge className={`text-xs ${getPillarColor(request.pillar)}`}>
            {getPillarLabel(request.pillar)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{Math.floor(request.wait_time / 60)}h {request.wait_time % 60}min</span>
          </div>
          <Button size="sm" onClick={(e) => {
            e.stopPropagation();
            handleCallClick(request);
          }}>
            <Phone className="h-3 w-3 mr-1" />
            Ligar
          </Button>
        </div>

        {request.notes && (
          <p className="text-xs text-muted-foreground italic">{request.notes}</p>
        )}
      </div>
    </Card>
  );

  // Calculate SLA statistics
  const totalPending = allRequests.filter(r => r.status === 'pending').length;
  const avgWaitTime = totalPending > 0
    ? Math.floor(allRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.wait_time, 0) / totalPending / 60)
    : 0;
  const slaBreaches = urgentRequests.length;
  const resolutionRate = allRequests.length > 0
    ? Math.floor((allRequests.filter(r => r.status === 'resolved').length / allRequests.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Pedidos de Chamada
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir solicitações de chamada organizadas por urgência
        </p>
      </div>

      <BentoGrid className="lg:grid-rows-2 gap-4">
        {/* Urgentes - Red */}
        <BentoCard
          name="Urgentes (SLA Ultrapassado)"
          description={`${urgentRequests.length} chamadas com >3h de espera`}
          Icon={AlertTriangle}
          className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50" />}
          iconColor="text-red-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <ScrollArea className="h-[400px] px-6 pb-6">
            <div className="space-y-3">
              {urgentRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem chamadas urgentes</p>
                </div>
              ) : (
                urgentRequests.map(renderRequestCard)
              )}
            </div>
          </ScrollArea>
        </BentoCard>

        {/* Prioridade - Yellow */}
        <BentoCard
          name="Prioridade Normal"
          description={`${priorityRequests.length} chamadas entre 1-3h`}
          Icon={Clock}
          className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />}
          iconColor="text-yellow-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <ScrollArea className="h-[400px] px-6 pb-6">
            <div className="space-y-3">
              {priorityRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem chamadas de prioridade</p>
                </div>
              ) : (
                priorityRequests.map(renderRequestCard)
              )}
            </div>
          </ScrollArea>
        </BentoCard>

        {/* Recentes - Green */}
        <BentoCard
          name="Recentes"
          description={`${recentRequests.length} chamadas com <1h`}
          Icon={Phone}
          className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
          background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />}
          iconColor="text-green-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <ScrollArea className="h-[400px] px-6 pb-6">
            <div className="space-y-3">
              {recentRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem chamadas recentes</p>
                </div>
              ) : (
                recentRequests.map(renderRequestCard)
              )}
            </div>
          </ScrollArea>
        </BentoCard>

        {/* Statistics - Purple */}
        <BentoCard
          name="Estatísticas de SLA"
          description="Desempenho e métricas de resposta"
          Icon={TrendingUp}
          className="lg:col-start-1 lg:col-end-4 lg:row-start-2 lg:row-end-3"
          background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50" />}
          iconColor="text-purple-600"
          textColor="text-gray-900"
          descriptionColor="text-gray-600"
          href="#"
          cta=""
        >
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {totalPending}
                </div>
                <p className="text-sm text-gray-600">Total Pendentes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {avgWaitTime}h
                </div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {slaBreaches}
                </div>
                <p className="text-sm text-gray-600">SLA Ultrapassado</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {resolutionRate}%
                </div>
                <p className="text-sm text-gray-600">Taxa Resolução</p>
              </div>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Call Modal */}
      {selectedRequest && (
        <CallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          request={selectedRequest}
          onComplete={handleCallComplete}
        />
      )}
    </div>
  );
};

export default EspecialistaCallRequestsRevamped;
