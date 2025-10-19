import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCallRequests } from '@/data/especialistaGeralMockData';
import { CallRequest } from '@/types/specialist';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

const EspecialistaCallRequests = () => {
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  
  // Filter requests by assigned companies and pending status
  const filteredRequests = filterByCompanyAccess(
    mockCallRequests.filter(req => req.status === 'pending')
  );

  const handleCallRequest = (request: CallRequest) => {
    toast({
      title: 'Ligação iniciada',
      description: `Ligando para ${request.user_phone}`,
    });
  };

  const handleMarkResolved = (requestId: string) => {
    toast({
      title: 'Pedido resolvido',
      description: 'O pedido foi marcado como resolvido.',
    });
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime < 60) return 'text-green-600';
    if (waitTime < 240) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPillarLabel = (pillar: string | null) => {
    const labels = {
      'psychological': 'Saúde Mental',
      'physical': 'Bem-Estar Físico', 
      'financial': 'Assistência Financeira',
      'legal': 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || 'Não definido';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Pedidos de Chamada
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir solicitações de chamada dos utilizadores das empresas atribuídas
        </p>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Não há chamadas pendentes no momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{request.user_name}</h3>
                      <Badge variant="outline">{request.company_name}</Badge>
                      <Badge variant="secondary">{getPillarLabel(request.pillar)}</Badge>
                      <div className={`text-sm font-medium ${getWaitTimeColor(request.wait_time)}`}>
                        <Clock className="inline h-4 w-4 mr-1" />
                        {Math.floor(request.wait_time / 60)}h {request.wait_time % 60}min
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <p><strong>Email:</strong> {request.user_email}</p>
                      <p><strong>Telefone:</strong> {request.user_phone}</p>
                      {request.notes && <p><strong>Notas:</strong> {request.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleCallRequest(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Ligar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkResolved(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EspecialistaCallRequests;
