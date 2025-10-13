import { useState } from 'react';
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

interface ChangeRequest {
  id: string;
  company: string;
  requestType: string;
  description: string;
  status: 'pendente' | 'em_analise' | 'resolvido';
  createdAt: string;
  requestedBy: string;
}

const mockRequests: ChangeRequest[] = [
  {
    id: '1',
    company: 'Tech Solutions Lda',
    requestType: 'Upgrade de Plano',
    description: 'Alterar de plano Basic para Premium',
    status: 'pendente',
    createdAt: '2024-01-15T10:30:00Z',
    requestedBy: 'João Silva',
  },
  {
    id: '2',
    company: 'Consulting Partners',
    requestType: 'Adicionar Colaboradores',
    description: 'Adicionar 10 novos colaboradores ao sistema',
    status: 'em_analise',
    createdAt: '2024-01-14T14:20:00Z',
    requestedBy: 'Maria Costa',
  },
  {
    id: '3',
    company: 'Wellness Corp',
    requestType: 'Alterar Sessões Alocadas',
    description: 'Aumentar de 50 para 100 sessões mensais',
    status: 'resolvido',
    createdAt: '2024-01-10T09:15:00Z',
    requestedBy: 'Pedro Santos',
  },
  {
    id: '4',
    company: 'Innovation Hub',
    requestType: 'Cancelamento de Serviço',
    description: 'Solicitar cancelamento do plano atual',
    status: 'pendente',
    createdAt: '2024-01-12T11:00:00Z',
    requestedBy: 'Ana Oliveira',
  },
  {
    id: '5',
    company: 'Future Tech',
    requestType: 'Mudança de Pilar',
    description: 'Adicionar pilar de Bem-Estar Físico ao pacote',
    status: 'em_analise',
    createdAt: '2024-01-13T16:45:00Z',
    requestedBy: 'Carlos Mendes',
  },
];

export default function AdminChangeRequestsTab() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChangeRequest[]>(mockRequests);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
