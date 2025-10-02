import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Plus, Search, Share, QrCode } from 'lucide-react';
import { companyUIcopy } from '@/data/companyUIcopy';
import { companyToasts } from '@/data/companyToastMessages';
import { 
  InviteCode, 
  getInviteCodesByCompany, 
  getSeatsStats,
  generateInviteCode,
  canGenerateMoreCodes,
  mockInviteCodes
} from '@/data/inviteCodesMockData';

export default function CompanyInvites() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);

  // Using first company for demo - in real app this would come from auth context
  const companyId = 'company-1';
  const seatsStats = getSeatsStats(companyId);

  useEffect(() => {
    setInviteCodes(getInviteCodesByCompany(companyId));
  }, []);

  const filteredCodes = inviteCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (code.issuedToUserEmail && code.issuedToUserEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (code.issuedToUserName && code.issuedToUserName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCodes = filteredCodes.filter(code => code.status === 'active');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    companyToasts.codesCopied(1);
  };

  const handleCopyInviteLink = (code: string) => {
    const link = `${window.location.origin}/register/employee?code=${code}`;
    navigator.clipboard.writeText(link);
    companyToasts.linkCopied();
  };

  const handleCopyAllActiveCodes = () => {
    const codes = activeCodes.map(code => code.code).join('\n');
    navigator.clipboard.writeText(codes);
    companyToasts.codesCopied(activeCodes.length);
  };

  const handleGenerateMissingCodes = () => {
    if (!canGenerateMoreCodes(companyId)) return;

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const stats = getSeatsStats(companyId);
      if (!stats) return;
      
      const codesNeeded = stats.purchased - stats.total;
      const newCodes: InviteCode[] = [];
      
      for (let i = 0; i < codesNeeded; i++) {
        const newCode: InviteCode = {
          id: `invite-new-${Date.now()}-${i}`,
          companyId: companyId,
          code: generateInviteCode(companyId),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        newCodes.push(newCode);
        mockInviteCodes.push(newCode);
      }
      
      setInviteCodes(prev => [...prev, ...newCodes]);
      setLoading(false);
      
      companyToasts.codesGenerated(codesNeeded);
    }, 1000);
  };

  const getStatusBadge = (status: InviteCode['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">{companyUIcopy.inviteCodes.status.active}</Badge>;
      case 'used':
        return <Badge variant="default">{companyUIcopy.inviteCodes.status.used}</Badge>;
      case 'revoked':
        return <Badge variant="destructive">{companyUIcopy.inviteCodes.status.revoked}</Badge>;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Códigos de Convite</h1>
        <p className="text-muted-foreground">Gerir convites para colaboradores da empresa</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Códigos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{activeCodes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={handleCopyAllActiveCodes}
            disabled={activeCodes.length === 0}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            {companyUIcopy.inviteCodes.actions.copyActive} ({activeCodes.length})
          </Button>
          
          <Button
            onClick={handleGenerateMissingCodes}
            disabled={!canGenerateMoreCodes(companyId) || loading}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'A gerar...' : companyUIcopy.inviteCodes.actions.generate}
          </Button>
          
          <Button variant="outline" onClick={() => {
            const csvData = activeCodes.map(code => ({
              Código: code.code,
              Estado: code.status,
              'Data de Criação': code.createdAt
            }));

            const csvContent = [
              Object.keys(csvData[0]).join(','),
              ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `codigos_ativos_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            companyToasts.dataExported();
          }}>
            <Download className="h-4 w-4 mr-2" />
            {companyUIcopy.inviteCodes.actions.export}
          </Button>
        </CardContent>
      </Card>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>{companyUIcopy.inviteCodes.banner}</strong>
        </p>
      </div>

      {/* Search and Filters */}
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
                          title="Copiar código"
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
                    <TableCell>
                      {code.status === 'active' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyInviteLink(code.code)}
                            className="h-8 w-8 p-0"
                            title={companyUIcopy.inviteCodes.actions.copyLink}
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => companyToasts.actionFailed("gerar QR Code – funcionalidade em breve")}
                            className="h-8 w-8 p-0"
                            title={companyUIcopy.inviteCodes.actions.qrCode}
                          >
                            <QrCode className="h-3 w-3" />
                          </Button>
                        </div>
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
  );
}