import { useState, useEffect } from 'react';
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
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const AdminCallRequests = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  
  // Admin sees all call requests (no company filtering)
  const allRequests = mockCallRequests;

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);
  
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
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
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

          {/* Bento Grid Layout - Fixed Sizing */}
          <div>
            <BentoGrid className="grid-rows-1" style={{ gridAutoRows: '100px' }}>
          {/* Summary Cards Row */}
          <BentoCard 
            name="Total Solicitações" 
            description={`${allRequests.length} total registadas`} 
            Icon={Phone} 
            onClick={() => {}} 
            className="col-span-1" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
            style={{ height: '100px' }}
          >
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-2xl font-bold text-blue-600">{allRequests.length}</div>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </BentoCard>

          <BentoCard 
            name="Pendentes" 
            description={`${allRequests.filter(r => r.status === 'pending').length} aguardam`} 
            Icon={Clock} 
            onClick={() => setStatusFilter('pending')} 
            className="col-span-1" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100" />}
            iconColor="text-red-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
            style={{ height: '100px' }}
          >
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-2xl font-bold text-red-600">
                {allRequests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </BentoCard>

          <BentoCard 
            name="Resolvidos" 
            description={`${allRequests.filter(r => r.status === 'resolved').length} concluídos`} 
            Icon={CheckCircle} 
            onClick={() => setStatusFilter('resolved')} 
            className="col-span-1" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />}
            iconColor="text-green-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
            style={{ height: '100px' }}
          >
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-2xl font-bold text-green-600">
                {allRequests.filter(r => r.status === 'resolved').length}
              </div>
              <p className="text-sm text-gray-600">Resolvidos</p>
            </div>
          </BentoCard>

        </BentoGrid>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Chamada</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredRequests.length} solicitações encontradas
            </p>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Phone className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {searchTerm || statusFilter !== 'all' || pillarFilter !== 'all' 
                    ? 'Nenhuma solicitação encontrada com os filtros aplicados'
                    : 'Não há solicitações de chamada registadas'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold text-sm">{request.user_name}</h4>
                          <Badge variant="outline" className="text-xs">{request.company_name}</Badge>
                          <Badge variant="secondary" className="text-xs">{getPillarLabel(request.pillar)}</Badge>
                          <Badge variant={getStatusBadgeVariant(request.status)} className="text-xs">
                            {request.status === 'pending' ? 'Pendente' : 'Resolvido'}
                          </Badge>
                          <div className={`text-xs font-medium ${getWaitTimeColor(request.wait_time)}`}>
                            <Clock className="inline h-3 w-3 mr-1" />
                            {Math.floor(request.wait_time / 60)}h {request.wait_time % 60}min
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>Email:</strong> {request.user_email}</p>
                          <p><strong>Telefone:</strong> {request.user_phone}</p>
                          {request.notes && <p><strong>Notas:</strong> {request.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleCallRequest(request)}
                          disabled={request.status === 'resolved'}
                          className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Ligar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkResolved(request.id)}
                          disabled={request.status === 'resolved'}
                          className="text-xs px-3 py-1"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCallRequests;
