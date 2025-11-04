import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, CheckCircle, Clock, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEscalatedChats } from '@/hooks/useEscalatedChats';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EspecialistaCallRequests = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { escalatedChats, isLoading } = useEscalatedChats();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  
  // Especialista Geral sees ALL escalated chats (no company filtering)
  // Filter for phone escalated chats that haven't been resolved yet
  const pendingRequests = escalatedChats.filter((chat: any) => 
    chat.status === 'phone_escalated' || chat.status === 'pending'
  );
  
  const resolvedRequests = escalatedChats.filter((chat: any) => 
    chat.status === 'resolved'
  );
  
  const filteredRequests = pendingRequests;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar pedidos...</p>
        </div>
      </div>
    );
  }

  const handleCallRequest = (request: any) => {
    setSelectedRequest(request);
    setIsCallModalOpen(true);
  };

  const handleResolveClick = (request: any) => {
    setSelectedRequest(request);
    setResolutionNotes('');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = async (skipNotes: boolean = false) => {
    if (!selectedRequest || !profile?.id) return;
    
    setIsResolving(true);
    try {
      // Update chat session status to resolved
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          status: 'resolved',
          phone_contact_made: true,
          ended_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Check if call log exists
      const { data: existingLog } = await supabase
        .from('specialist_call_logs')
        .select('id')
        .eq('chat_session_id', selectedRequest.id)
        .single();

      if (existingLog) {
        // Update existing call log
        await supabase
          .from('specialist_call_logs')
          .update({ 
            call_status: 'completed',
            completed_at: new Date().toISOString(),
            call_notes: skipNotes ? null : resolutionNotes || null,
            outcome: 'resolved',
            specialist_id: profile.id
          })
          .eq('chat_session_id', selectedRequest.id);
      } else {
        // Create new call log if none exists
        await supabase
          .from('specialist_call_logs')
          .insert({
            chat_session_id: selectedRequest.id,
            user_id: selectedRequest.user_id,
            specialist_id: profile.id,
            call_status: 'completed',
            completed_at: new Date().toISOString(),
            call_notes: skipNotes ? null : resolutionNotes || null,
            outcome: 'resolved'
          });
      }

      toast({
        title: 'Pedido resolvido',
        description: 'O pedido foi marcado como resolvido com sucesso.',
      });

      // Close modal and reset
      setIsResolveModalOpen(false);
      setSelectedRequest(null);
      setResolutionNotes('');
      
      // The useEscalatedChats hook has a realtime subscription that will auto-refresh
    } catch (error) {
      console.error('Error resolving request:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resolver o pedido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getWaitTimeColor = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const hours = elapsed / (1000 * 60 * 60);
    if (hours >= 15) return 'text-red-600 font-bold';
    if (hours >= 5) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-medium';
  };
  
  const formatWaitTime = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
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
      'saude_mental': 'bg-blue-100 text-blue-700 border-blue-300',
      'psychological': 'bg-blue-100 text-blue-700 border-blue-300',
      'bem_estar_fisico': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'physical': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'assistencia_financeira': 'bg-green-100 text-green-700 border-green-300',
      'financial': 'bg-green-100 text-green-700 border-green-300',
      'assistencia_juridica': 'bg-purple-100 text-purple-700 border-purple-300',
      'legal': 'bg-purple-100 text-purple-700 border-purple-300'
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
            Gerir solicitações de chamada dos utilizadores
          </p>
        </div>

      {/* Tabs for Pending and Resolved */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolvidos ({resolvedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Pedidos de Chamada Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <EmptyState
                  icon={Phone}
                  title="Nenhum pedido pendente"
                  description="Quando os colaboradores solicitarem chamadas, aparecerão aqui."
                />
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="font-semibold">{request.user_name}</h4>
                      <Badge variant="outline">{request.company_name}</Badge>
                      <Badge variant="secondary" className={getPillarColor(request.pillar)}>{getPillarLabel(request.pillar)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Email:</strong> {request.user_email}</p>
                      <p><strong>Telefone:</strong> {request.user_phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
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
                        size="default"
                        variant="outline"
                        onClick={() => handleResolveClick(request)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${getWaitTimeColor(request.created_at)}`}>
                      <Clock className="h-4 w-4" />
                      <span>{formatWaitTime(request.created_at)}</span>
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resolved Requests Tab */}
        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Pedidos Resolvidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resolvedRequests.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="Nenhum pedido resolvido"
                  description="Os pedidos resolvidos aparecerão aqui."
                />
              ) : (
                <div className="space-y-4">
                  {resolvedRequests.map((request) => (
                    <div key={request.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold">{request.user_name}</h4>
                          <Badge variant="outline">{request.company_name}</Badge>
                          <Badge variant="secondary" className={getPillarColor(request.pillar)}>{getPillarLabel(request.pillar)}</Badge>
                          <Badge variant="default" className="bg-green-600">Resolvido</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Email:</strong> {request.user_email}</p>
                          <p><strong>Telefone:</strong> {request.user_phone || 'N/A'}</p>
                          {request.call_log?.notes && (
                            <p><strong>Notas:</strong> {request.call_log.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(request.ended_at || request.created_at).toLocaleString('pt-PT')}</span>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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

      {/* Resolve Modal - Full Screen */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6" />
              Resolver Pedido de Chamada
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* User Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Informações do Utilizador</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedRequest?.user_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest?.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedRequest?.user_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pilar</p>
                  <p className="font-medium">{getPillarLabel(selectedRequest?.pillar)}</p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">Notas de Resolução</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione notas sobre a chamada, resolução, ou próximos passos (opcional)
                </p>
              </div>
              <Textarea
                placeholder="Ex: Contactei o utilizador, discutimos o problema e marcamos sessão com psicólogo..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="min-h-[200px] text-base"
              />
              <p className="text-xs text-muted-foreground">
                {resolutionNotes.length} caracteres
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsResolveModalOpen(false);
                setResolutionNotes('');
              }}
              disabled={isResolving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleConfirmResolve(true)}
              disabled={isResolving}
            >
              Saltar e Resolver
            </Button>
            <Button
              onClick={() => handleConfirmResolve(false)}
              disabled={isResolving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isResolving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  A resolver...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar e Resolver
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EspecialistaCallRequests;
