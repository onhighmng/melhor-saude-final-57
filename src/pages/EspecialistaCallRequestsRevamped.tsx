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
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { CallModal } from '@/components/specialist/CallModal';
import { motion, AnimatePresence } from 'framer-motion';

const EspecialistaCallRequestsRevamped = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { filterByCompanyAccess } = useCompanyFilter();
  const { escalatedChats, isLoading } = useEscalatedChats();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('pending');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [resolvedRequestId, setResolvedRequestId] = useState<string | null>(null);

  // Use real data from hook
  const allRequests = filterByCompanyAccess(escalatedChats);
  const requestsToShow = allRequests;

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
    setResolvedRequestId(requestId);
    setShowSuccessAnimation(true);
    
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setResolvedRequestId(null);
      toast({
        title: 'Pedido Resolvido',
        description: 'O pedido foi marcado como resolvido com sucesso.',
      });
    }, 1500);
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
      psychological: { bg: 'hsl(210 80% 95%)', text: 'hsl(210 80% 40%)' },
      physical: { bg: 'hsl(45 90% 90%)', text: 'hsl(45 90% 35%)' },
      financial: { bg: 'hsl(140 60% 95%)', text: 'hsl(140 60% 35%)' },
      legal: { bg: 'hsl(270 60% 95%)', text: 'hsl(270 60% 40%)' }
    };
    return colors[pillar as keyof typeof colors] || { bg: 'hsl(0 0% 95%)', text: 'hsl(0 0% 40%)' };
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
    <div className="space-y-6 relative">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15 
              }}
              className="bg-white rounded-full p-8 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <CheckCircle className="h-16 w-16 text-white" strokeWidth={3} />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-heading font-bold">
          Chamada de Triagem
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
                        <Badge 
                          className="text-xs border-transparent" 
                          style={{ 
                            backgroundColor: getPillarColor(request.pillar).bg, 
                            color: getPillarColor(request.pillar).text 
                          }}
                        >
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
                        <Badge 
                          className="text-xs border-transparent" 
                          style={{ 
                            backgroundColor: getPillarColor(request.pillar).bg, 
                            color: getPillarColor(request.pillar).text 
                          }}
                        >
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
                    <Badge 
                      className="text-xs border-transparent" 
                      style={{ 
                        backgroundColor: getPillarColor(selectedRequest.pillar).bg, 
                        color: getPillarColor(selectedRequest.pillar).text 
                      }}
                    >
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
