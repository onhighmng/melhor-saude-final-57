import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, CheckCircle, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCallRequests } from '@/data/especialistaGeralMockData';
import { CallRequest } from '@/types/specialist';

const EspecialistaCallRequests = () => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<CallRequest | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  
  // Show all pending requests (no company filtering for demo purposes)
  const filteredRequests = mockCallRequests.filter(req => req.status === 'pending');

  const handleCallRequest = (request: CallRequest) => {
    setSelectedRequest(request);
    setIsCallModalOpen(true);
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

  const getPillarColor = (pillar: string | null) => {
    const colors = {
      'psychological': 'bg-purple-100 text-purple-700 border-purple-300',
      'physical': 'bg-green-100 text-green-700 border-green-300',
      'financial': 'bg-blue-100 text-blue-700 border-blue-300',
      'legal': 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Pedidos de Chamada
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerir solicitações de chamada dos utilizadores das empresas atribuídas
          </p>
        </div>

      {/* Call Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Pedidos de Chamada Pendentes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredRequests.length} pedidos de chamada pendentes
          </p>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Não há chamadas pendentes no momento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="font-semibold">{request.user_name}</h4>
                      <Badge variant="outline">{request.company_name}</Badge>
                      <Badge variant="secondary" className={getPillarColor(request.pillar)}>{getPillarLabel(request.pillar)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Email:</strong> {request.user_email}</p>
                      <p><strong>Telefone:</strong> {request.user_phone}</p>
                      {request.notes && <p><strong>Notas:</strong> {request.notes}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Button 
                      size="sm" 
                      onClick={() => handleCallRequest(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Ligar
                    </Button>
                    <Button 
                      size="default"
                      variant="outline"
                      onClick={() => handleMarkResolved(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolver
                    </Button>
                    <div className={`text-sm font-medium ${getWaitTimeColor(request.wait_time)} flex items-center gap-1 mt-2`}>
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(request.wait_time / 60)}h {request.wait_time % 60}min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Call Modal */}
      <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Iniciar Chamada</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{selectedRequest.user_name}</h3>
                  <p className="text-2xl font-mono text-primary font-bold">{selectedRequest.user_phone}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EspecialistaCallRequests;
