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
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { CallModal } from '@/components/specialist/CallModal';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const EspecialistaCallRequestsRevamped = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { escalatedChats, isLoading } = useEscalatedChats();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('pending');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [resolvedRequestId, setResolvedRequestId] = useState<string | null>(null);

  // Especialista Geral sees ALL escalated chats (no company filtering)
  const requestsToShow = escalatedChats;

  // Filter by status - use phone_escalated for pending requests
  const pendingRequests = useMemo(() => {
    return requestsToShow.filter(r => r.status === 'phone_escalated');
  }, [requestsToShow]);

  const resolvedRequests = useMemo(() => {
    return requestsToShow.filter(r => r.status === 'resolved');
  }, [requestsToShow]);

  // Sort by wait time (priority)
  const sortedRequests = useMemo(() => {
    const requests = activeTab === 'pending' ? pendingRequests : resolvedRequests;
    return [...requests].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [pendingRequests, resolvedRequests, sortOrder, activeTab]);

  const handleCallClick = (request: any) => {
    setSelectedRequest(request);
    setIsCallModalOpen(true);
  };

  const handleViewUserInfo = (request: any) => {
    setSelectedRequest(request);
    setIsUserInfoModalOpen(true);
  };

  const handleMarkResolved = async (requestId: string) => {
    try {
      setResolvedRequestId(requestId);
      setShowSuccessAnimation(true);
      
      // Update chat session status to resolved
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          status: 'resolved',
          phone_contact_made: true,
          ended_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update specialist_call_logs status
      await supabase
        .from('specialist_call_logs')
        .update({ 
          call_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('chat_session_id', requestId);
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setResolvedRequestId(null);
        toast({
          title: 'Pedido Resolvido',
          description: 'O pedido foi marcado como resolvido com sucesso.',
        });
        // The useEscalatedChats hook has a realtime subscription that will auto-refresh
      }, 1500);
    } catch (error) {
      console.error('Error resolving request:', error);
      setShowSuccessAnimation(false);
      setResolvedRequestId(null);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar o pedido como resolvido.',
        variant: 'destructive',
      });
    }
  };

  const handleCallComplete = async (outcome: string, notes: string) => {
    if (!selectedRequest) return;
    
    try {
      // Save call log to database
      const { error: callLogError } = await supabase
        .from('specialist_call_logs')
        .insert({
          chat_session_id: selectedRequest.id,
          user_id: selectedRequest.user_id,
          specialist_id: profile?.id,
          call_status: 'completed',
          call_notes: notes,
          outcome: outcome,
          completed_at: new Date().toISOString(),
        });

      if (callLogError) throw callLogError;

      // Update chat session status based on outcome
      const newStatus = outcome === 'resolved_by_phone' || outcome === 'session_booked' 
        ? 'resolved' 
        : 'phone_escalated';
      
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .update({
          status: newStatus,
          phone_contact_made: true,
          ...(newStatus === 'resolved' && { ended_at: new Date().toISOString() })
        })
        .eq('id', selectedRequest.id);

      if (sessionError) throw sessionError;

      toast({
        title: 'Chamada Finalizada',
        description: `Resultado: ${outcome}. Notas guardadas com sucesso.`,
      });
      
      setIsCallModalOpen(false);
      // Trigger refresh of escalated chats
      window.location.reload();
    } catch (error) {
      console.error('Error saving call completion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível guardar os detalhes da chamada.',
        variant: 'destructive',
      });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getPillarLabel = (pillar: string | null) => {
    const labels = {
      'saude_mental': 'Saúde Mental',
      'psychological': 'Saúde Mental',
      'bem_estar_fisico': 'Bem-estar Físico',
      'physical': 'Bem-estar Físico',
      'assistencia_financeira': 'Assistência Financeira',
      'financial': 'Assistência Financeira',
      'assistencia_juridica': 'Assistência Jurídica',
      'legal': 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || 'Não definido';
  };

  const getPillarColor = (pillar: string | null) => {
    const colors = {
      'saude_mental': { bg: '#3b82f6', text: '#ffffff' }, // Blue
      'psychological': { bg: '#3b82f6', text: '#ffffff' },
      'bem_estar_fisico': { bg: '#eab308', text: '#ffffff' }, // Yellow
      'physical': { bg: '#eab308', text: '#ffffff' },
      'assistencia_financeira': { bg: '#22c55e', text: '#ffffff' }, // Green
      'financial': { bg: '#22c55e', text: '#ffffff' },
      'assistencia_juridica': { bg: '#a855f7', text: '#ffffff' }, // Purple
      'legal': { bg: '#a855f7', text: '#ffffff' }
    };
    return colors[pillar as keyof typeof colors] || { bg: '#6b7280', text: '#ffffff' };
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

  const formatWaitTime = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const getWaitTimeColor = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const hours = elapsed / (1000 * 60 * 60);
    if (hours >= 15) return 'text-red-600 font-bold';
    if (hours >= 5) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-medium';
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
                        <div className={`flex items-center gap-1 ${getWaitTimeColor(request.created_at)}`}>
                          <Clock className="h-4 w-4" />
                          <span>{formatWaitTime(request.created_at)}</span>
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
                      <div className={`flex items-center gap-2 text-sm ${getWaitTimeColor(selectedRequest.created_at)}`}>
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{formatWaitTime(selectedRequest.created_at)}</span>
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
