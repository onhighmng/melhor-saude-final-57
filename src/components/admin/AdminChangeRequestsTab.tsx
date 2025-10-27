import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Calendar, FileEdit, Check, Search } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatting';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChangeRequest {
  id: string;
  company: string;
  requestType: string;
  description: string;
  status: 'pendente' | 'em_analise' | 'resolvido';
  createdAt: string;
  requestedBy: string;
  providerName?: string;
  providerEmail?: string;
}

// Mock data removed - using real database

export default function AdminChangeRequestsTab() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const { profile } = useAuth();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadChangeRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('change_requests')
        .select(`
          *,
          prestador:prestadores!prestador_id(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: ChangeRequest[] = (data || []).map(req => ({
        id: req.id,
        company: (req.prestador as any)?.name || 'N/A',
        requestType: req.request_type || 'profile_update',
        description: JSON.stringify(req.requested_data || {}),
        status: req.status === 'pending' ? 'pendente' : req.status === 'approved' ? 'resolvido' : 'em_analise',
        createdAt: req.created_at,
        requestedBy: (req.prestador as any)?.name || 'N/A',
        providerName: (req.prestador as any)?.name || 'N/A',
        providerEmail: (req.prestador as any)?.email || 'N/A'
      }));

      setRequests(formatted);
    } catch (error: any) {
      console.error('Error loading change requests:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pedidos de alteração',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { data: request } = await supabase
        .from('change_requests')
        .select('prestador_id, requested_data')
        .eq('id', requestId)
        .single();

      if (!request) throw new Error('Request not found');

      await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      await supabase
        .from('prestadores')
        .update(request.requested_data as any)
        .eq('id', request.prestador_id);

      await supabase.from('admin_logs').insert({
        admin_id: profile?.id,
        action: 'approve_change_request',
        entity_type: 'change_request',
        entity_id: requestId,
        details: { changes: request.requested_data }
      });

      toast({
        title: 'Aprovado',
        description: 'Pedido aprovado com sucesso'
      });

      loadChangeRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aprovar pedido',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      await supabase
        .from('change_requests')
        .update({
          status: 'rejected',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', requestId);

      await supabase.from('admin_logs').insert({
        admin_id: profile?.id,
        action: 'reject_change_request',
        entity_type: 'change_request',
        entity_id: requestId,
        details: { reason }
      });

      toast({
        title: 'Rejeitado',
        description: 'Pedido rejeitado'
      });

      loadChangeRequests();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao rejeitar pedido',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadChangeRequests();
  }, []);

  const getStatusColor = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'pendente':
        return 'destructive';
      case 'em_analise':
        return 'default';
      case 'resolvido':
        return 'secondary';
    }
  };

  const getStatusLabel = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_analise':
        return 'Em Análise';
      case 'resolvido':
        return 'Resolvido';
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch =
      request.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleMarkAsResolved = (requestId: string) => {
    const updatedRequests = requests.map((request) =>
      request.id === requestId ? { ...request, status: 'resolvido' as const } : request
    );
    setRequests(updatedRequests);
    toast({
      title: 'Pedido Resolvido',
      description: 'O pedido foi marcado como resolvido com sucesso.',
    });
  };

  const stats = {
    total: requests.length,
    pendente: requests.filter((r) => r.status === 'pendente').length,
    em_analise: requests.filter((r) => r.status === 'em_analise').length,
    resolvido: requests.filter((r) => r.status === 'resolvido').length,
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.pendente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.em_analise}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.resolvido}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pedidos de Alteração</CardTitle>
              <CardDescription>Gerir solicitações de mudanças das empresas</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar pedidos..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo de Pedido</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Solicitado por</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{request.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileEdit className="h-4 w-4 text-muted-foreground" />
                      {request.requestType}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground truncate">{request.description}</p>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(request.status)}>{getStatusLabel(request.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(request.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status !== 'resolvido' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsResolved(request.id)}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Marcar como Resolvido
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
