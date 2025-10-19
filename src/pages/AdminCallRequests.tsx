import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle, Clock, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockCallRequests } from '@/data/especialistaGeralMockData';
import { CallRequest } from '@/types/specialist';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminCallRequests = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  
  // Admin sees all call requests (no company filtering)
  const allRequests = mockCallRequests;
  
  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPillar = pillarFilter === 'all' || request.pillar === pillarFilter;
    
    return matchesSearch && matchesStatus && matchesPillar;
  });

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Solicitações de Chamada
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir todas as solicitações de chamada de utilizadores que clicaram "Quero falar com alguém"
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar por nome ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pillarFilter} onValueChange={setPillarFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por pilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pilares</SelectItem>
            <SelectItem value="psychological">Saúde Mental</SelectItem>
            <SelectItem value="physical">Bem-Estar Físico</SelectItem>
            <SelectItem value="financial">Assistência Financeira</SelectItem>
            <SelectItem value="legal">Assistência Jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRequests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allRequests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allRequests.filter(r => r.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(allRequests.reduce((acc, r) => acc + r.wait_time, 0) / allRequests.length)}min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || pillarFilter !== 'all' 
                ? 'Nenhuma solicitação encontrada com os filtros aplicados'
                : 'Não há solicitações de chamada registadas'
              }
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
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold">{request.user_name}</h3>
                      <Badge variant="outline">{request.company_name}</Badge>
                      <Badge variant="secondary">{getPillarLabel(request.pillar)}</Badge>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status === 'pending' ? 'Pendente' : 'Resolvido'}
                      </Badge>
                      <div className={`text-sm font-medium ${getWaitTimeColor(request.wait_time)}`}>
                        <Clock className="inline h-4 w-4 mr-1" />
                        {Math.floor(request.wait_time / 60)}h {request.wait_time % 60}min
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2 space-y-1">
                      <p><strong>Email:</strong> {request.user_email}</p>
                      <p><strong>Telefone:</strong> {request.user_phone}</p>
                      <p><strong>Criado em:</strong> {new Date(request.created_at).toLocaleString('pt-PT')}</p>
                      {request.notes && <p><strong>Notas:</strong> {request.notes}</p>}
                      {request.resolved_at && (
                        <p><strong>Resolvido em:</strong> {new Date(request.resolved_at).toLocaleString('pt-PT')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleCallRequest(request)}
                      disabled={request.status === 'resolved'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Ligar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkResolved(request.id)}
                      disabled={request.status === 'resolved'}
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

export default AdminCallRequests;
