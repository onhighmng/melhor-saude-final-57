import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Clock, CheckCircle, ArrowUpDown, User, Building2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCallRequests } from '@/data/especialistaGeralMockData';
import { CallRequest } from '@/types/specialist';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { CallModal } from '@/components/specialist/CallModal';

const EspecialistaCallRequestsRevamped = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedRequest, setSelectedRequest] = useState<CallRequest | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('pending');

  // Filter requests
  const allRequests = filterByCompanyAccess(mockCallRequests);
  
  // Debug: Show all if filter returns empty (for demo purposes)
  const requestsToShow = allRequests.length > 0 ? allRequests : mockCallRequests;

  // Filter by status
  const pendingRequests = useMemo(() => {
    return requestsToShow.filter(r => r.status === 'pending');
  }, [requestsToShow]);

  const resolvedRequests = useMemo(() => {
    return requestsToShow.filter(r => r.status === 'resolved' || r.status === 'escalated');
  }, [requestsToShow]);

  // Sort by wait time (priority)
  const sortedRequests = useMemo(() => {
    const requests = activeTab === 'pending' ? pendingRequests : resolvedRequests;
    return [...requests].sort((a, b) => {
      return sortOrder === 'desc' ? b.wait_time - a.wait_time : a.wait_time - b.wait_time;
    });
  }, [pendingRequests, resolvedRequests, sortOrder, activeTab]);

  const handleCallClick = (request: CallRequest) => {
    setSelectedRequest(request);
    setIsCallModalOpen(true);
  };

  const handleViewUserInfo = (request: CallRequest) => {
    setSelectedRequest(request);
    setIsUserInfoModalOpen(true);
  };

  const handleMarkResolved = (requestId: string) => {
    toast({
      title: 'Pedido Resolvido',
      description: 'O pedido foi marcado como resolvido com sucesso.',
    });
  };

  const handleCallComplete = (outcome: string, notes: string) => {
    toast({
      title: 'Chamada Finalizada',
      description: `Resultado: ${outcome}. Notas guardadas com sucesso.`,
    });
    setIsCallModalOpen(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      escalated: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Pendente',
      resolved: 'Resolvido',
      escalated: 'Escalado'
    };
    return {
      variant: variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700',
      label: labels[status as keyof typeof labels] || status
    };
  };

  const formatWaitTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes >= 1440) return 'text-red-600 font-bold'; // >24h - SLA breach
    if (minutes >= 180) return 'text-orange-600 font-semibold'; // >3h - urgent
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Pedidos de Chamada
        </h1>
        <p className="text-muted-foreground mt-1">
          📌 Mostra todos os colaboradores que pediram "falar com alguém"
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolvidos ({resolvedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Pilar Sugerido</TableHead>
                  <TableHead className="cursor-pointer" onClick={toggleSortOrder}>
                    <div className="flex items-center gap-2">
                      Tempo de Espera
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Sem pedidos pendentes
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => handleViewUserInfo(request)}
                        >
                          <div className="text-left">
                            <div className="font-medium flex items-center gap-2 hover:text-primary">
                              <User className="h-4 w-4" />
                              {request.user_name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {request.user_email}
                            </div>
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getPillarColor(request.pillar)}`}>
                          {getPillarLabel(request.pillar)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${getWaitTimeColor(request.wait_time)}`}>
                          <Clock className="h-4 w-4" />
                          <span>{formatWaitTime(request.wait_time)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCallClick(request)}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Ligar agora
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleMarkResolved(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Pilar</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Sem pedidos resolvidos
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => handleViewUserInfo(request)}
                        >
                          <div className="text-left">
                            <div className="font-medium flex items-center gap-2 hover:text-primary">
                              <User className="h-4 w-4" />
                              {request.user_name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {request.user_email}
                            </div>
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getPillarColor(request.pillar)}`}>
                          {getPillarLabel(request.pillar)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusBadge(request.status).variant}`}>
                          {getStatusBadge(request.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUserInfo(request)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Info Modal */}
      <Dialog open={isUserInfoModalOpen} onOpenChange={setIsUserInfoModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Colaborador
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* User Details Card */}
              <Card className="border-2">
                <div className="p-6 space-y-4">
                  {/* Name and Company */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold">{selectedRequest.user_name}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{selectedRequest.company_name}</span>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getPillarColor(selectedRequest.pillar)}`}>
                      {getPillarLabel(selectedRequest.pillar)}
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className="grid gap-4 pt-4 border-t">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href={`mailto:${selectedRequest.user_email}`} className="hover:underline">
                          {selectedRequest.user_email}
                        </a>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href={`tel:${selectedRequest.user_phone}`} className="hover:underline">
                          {selectedRequest.user_phone}
                        </a>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground">Tempo de Espera</label>
                      <div className={`flex items-center gap-2 text-sm ${getWaitTimeColor(selectedRequest.wait_time)}`}>
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{formatWaitTime(selectedRequest.wait_time)}</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <div>
                        <Badge className={`text-xs ${getStatusBadge(selectedRequest.status).variant}`}>
                          {getStatusBadge(selectedRequest.status).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedRequest.notes && (
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Notas do Pedido
                      </label>
                      <p className="text-sm bg-muted p-3 rounded-lg">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUserInfoModalOpen(false)}>
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    setIsUserInfoModalOpen(false);
                    handleCallClick(selectedRequest);
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar Agora
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
