import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Users, Clock, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface ChangeRequest {
  id: string;
  prestador_id: string;
  request_type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  current_data: any;
  requested_data: any;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  prestadores?: {
    name: string;
    email: string;
  };
}

const AdminProviderChangeRequests = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    loadRequests();

    // Real-time subscription
    const channel = supabase
      .channel('change-requests-updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'change_requests'
        },
        () => loadRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('change_requests')
        .select(`
          *,
          prestadores (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as ChangeRequest[]);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, apply changes to prestadores table
      if (approved && selectedRequest) {
        const { error: updateError } = await supabase
          .from('prestadores')
          .update(selectedRequest.requested_data)
          .eq('id', selectedRequest.prestador_id);

        if (updateError) throw updateError;
      }

      toast.success(approved ? 'Pedido aprovado' : 'Pedido rejeitado');
      setReviewDialogOpen(false);
      setReviewNotes('');
      loadRequests();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast.error('Erro ao processar pedido');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendente' },
      approved: { color: 'bg-green-100 text-green-700', label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejeitado' }
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Pedidos de Mudança de Prestador
          </h1>
          <p className="text-muted-foreground">
            Gerir pedidos de mudança e reatribuição de prestadores
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Aguardam decisão</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprovados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejeitados
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{rejectedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Aprovação
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {requests.length > 0 
                  ? Math.round((approvedRequests.length / requests.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Total de pedidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Pedidos de Mudança</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum pedido
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Não há pedidos de mudança pendentes no momento
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.prestadores?.name}</div>
                          <div className="text-sm text-muted-foreground">{request.prestadores?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{request.request_type.replace('_', ' ')}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), {
                          addSuffix: true,
                          locale: pt
                        })}
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewDialogOpen(true);
                            }}
                          >
                            Rever
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewDialogOpen(true);
                            }}
                          >
                            Ver Detalhes
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rever Pedido de Mudança</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Prestador</Label>
                <p className="text-sm font-medium">{selectedRequest.prestadores?.name}</p>
              </div>
              <div>
                <Label>Tipo de Pedido</Label>
                <p className="text-sm capitalize">{selectedRequest.request_type.replace('_', ' ')}</p>
              </div>
              <div>
                <Label>Motivo</Label>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              {selectedRequest.status === 'pending' && (
                <>
                  <div>
                    <Label>Notas de Revisão (opcional)</Label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Adicione notas sobre a decisão..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleReview(selectedRequest.id, true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleReview(selectedRequest.id, false)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </>
              )}
              {selectedRequest.review_notes && (
                <div>
                  <Label>Notas da Revisão</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.review_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProviderChangeRequests;
