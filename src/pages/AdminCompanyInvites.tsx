import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Copy, Download, Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  InviteCode, 
  getCompanyById, 
  getInviteCodesByCompany, 
  getSeatsStats,
  generateInviteCode,
  canGenerateMoreCodes,
  mockInviteCodes
} from '@/data/inviteCodesMockData';

export default function AdminCompanyInvites() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);

  const company = id ? getCompanyById(id) : null;
  const seatsStats = id ? getSeatsStats(id) : null;

  useEffect(() => {
    if (id) {
      setInviteCodes(getInviteCodesByCompany(id));
    }
  }, [id]);

  const filteredCodes = inviteCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (code.issuedToUserEmail && code.issuedToUserEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (code.issuedToUserName && code.issuedToUserName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "Código de convite copiado para a área de transferência.",
    });
  };

  const handleGenerateMissingCodes = () => {
    if (!id || !company || !canGenerateMoreCodes(id)) return;

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const stats = getSeatsStats(id);
      if (!stats) return;
      
      const codesNeeded = stats.purchased - stats.total;
      const newCodes: InviteCode[] = [];
      
      for (let i = 0; i < codesNeeded; i++) {
        const newCode: InviteCode = {
          id: `invite-new-${Date.now()}-${i}`,
          companyId: id,
          code: generateInviteCode(id),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        newCodes.push(newCode);
        mockInviteCodes.push(newCode);
      }
      
      setInviteCodes(prev => [...prev, ...newCodes]);
      setLoading(false);
      
      toast({
        title: "Códigos gerados",
        description: `${codesNeeded} novo${codesNeeded > 1 ? 's' : ''} código${codesNeeded > 1 ? 's' : ''} de convite gerado${codesNeeded > 1 ? 's' : ''}.`,
      });
    }, 1000);
  };

  const handleRevokeCode = (codeId: string) => {
    setInviteCodes(prev => prev.map(code => 
      code.id === codeId 
        ? { ...code, status: 'revoked' as const, revokedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : code
    ));
    
    // Update mock data
    const codeIndex = mockInviteCodes.findIndex(code => code.id === codeId);
    if (codeIndex !== -1) {
      mockInviteCodes[codeIndex] = {
        ...mockInviteCodes[codeIndex],
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    toast({
      title: "Código revogado",
      description: "O código de convite foi revogado com sucesso.",
    });
  };

  const handleRegenerateCode = (codeId: string) => {
    if (!id) return;
    
    const newCode: InviteCode = {
      id: `invite-regen-${Date.now()}`,
      companyId: id,
      code: generateInviteCode(id),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Revoke old code and add new one
    setInviteCodes(prev => [
      ...prev.map(code => 
        code.id === codeId 
          ? { ...code, status: 'revoked' as const, revokedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : code
      ),
      newCode
    ]);
    
    // Update mock data
    const codeIndex = mockInviteCodes.findIndex(code => code.id === codeId);
    if (codeIndex !== -1) {
      mockInviteCodes[codeIndex] = {
        ...mockInviteCodes[codeIndex],
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    mockInviteCodes.push(newCode);
    
    toast({
      title: "Código regenerado",
      description: "Novo código de convite gerado com sucesso.",
    });
  };

  const getStatusBadge = (status: InviteCode['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">Ativo</Badge>;
      case 'used':
        return <Badge variant="default">Utilizado</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revogado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Empresa não encontrada</h1>
          <Link to="/admin/companies" className="inline-flex items-center mt-4 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às empresas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/companies" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">Gestão de códigos de convite</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lugares Comprados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seatsStats?.purchased || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lugares Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{seatsStats?.used || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lugares Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{seatsStats?.available || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Códigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seatsStats?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou utilizador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[300px]"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="used">Utilizado</SelectItem>
              <SelectItem value="revoked">Revogado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateMissingCodes}
            disabled={!canGenerateMoreCodes(id!) || loading}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'A gerar...' : 'Gerar códigos em falta'}
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {inviteCodes.length === 0 
                  ? "Sem códigos de convite. Clique em 'Gerar códigos em falta' para criar convites."
                  : "Nenhum código encontrado com os filtros atuais."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Utilizado por</TableHead>
                  <TableHead>Data de Utilização</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {code.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(code.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(code.status)}</TableCell>
                    <TableCell>
                      {code.issuedToUserName ? (
                        <div>
                          <div className="font-medium">{code.issuedToUserName}</div>
                          <div className="text-sm text-muted-foreground">{code.issuedToUserEmail}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(code.redeemedAt)}</TableCell>
                    <TableCell>{formatDate(code.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {code.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevokeCode(code.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        {(code.status === 'active' || code.status === 'revoked') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRegenerateCode(code.id)}
                            className="h-8 w-8 p-0"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}