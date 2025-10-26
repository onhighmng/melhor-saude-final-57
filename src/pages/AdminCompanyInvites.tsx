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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InviteCode {
  id: string;
  company_id: string;
  email: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  sessions_allocated: number;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  invited_by: string | null;
}

function generateInviteCode(companyId: string): string {
  const prefix = companyId.slice(0, 4).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}`;
}

export default function AdminCompanyInvites() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [seatsStats, setSeatsStats] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      // Load company
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      setCompany(companyData);

      // Load seats stats from company
      if (companyData) {
        setSeatsStats({
          purchased: companyData.sessions_allocated || 0,
          used: 0,
          available: 0
        });
      }

      // Load invite codes
      const { data: codes, error } = await supabase
        .from('invites')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInviteCodes((codes || []).map(code => ({
        ...code,
        status: code.status as 'pending' | 'accepted' | 'revoked' | 'expired'
      })));
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredCodes = inviteCodes.filter(code => {
    const matchesSearch = code.invite_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (code.email && code.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
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

  const canGenerateMoreCodes = () => {
    if (!company || !seatsStats) return false;
    const currentCodes = inviteCodes.filter(c => c.status === 'pending' || c.status === 'accepted').length;
    return currentCodes < company.sessions_allocated;
  };

  const handleGenerateMissingCodes = async () => {
    if (!id || !company || !canGenerateMoreCodes() || !profile) return;

    setLoading(true);
    
    try {
      const codesNeeded = Math.max(0, (company.sessions_allocated || 0) - inviteCodes.length);
      
      if (codesNeeded <= 0) {
        toast({
          title: "Sem necessidade",
          description: "Já existem códigos suficientes.",
        });
        setLoading(false);
        return;
      }

      const newCodes = [];
      
      for (let i = 0; i < codesNeeded; i++) {
        const inviteCode = generateInviteCode(id);
        
        const { data, error } = await supabase
          .from('invites')
          .insert({
            company_id: id,
            email: `temp_${i}@company.com`,
            invited_by: profile.id,
            status: 'pending',
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        newCodes.push(data);
      }
      
      setInviteCodes(prev => [...prev, ...newCodes]);
      
      toast({
        title: "Códigos gerados",
        description: `${codesNeeded} novo${codesNeeded > 1 ? 's' : ''} código${codesNeeded > 1 ? 's' : ''} de convite gerado${codesNeeded > 1 ? 's' : ''}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar códigos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', codeId);

      if (error) throw error;

      setInviteCodes(prev => prev.map(code => 
        code.id === codeId 
          ? { ...code, status: 'revoked' as const }
          : code
      ));
      
      toast({
        title: "Código revogado",
        description: "O código de convite foi revogado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao revogar código",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRegenerateCode = async (codeId: string) => {
    if (!id || !profile) return;
    
    try {
      // Revoke old code
      await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', codeId);

      // Create new code
      const { data: newCode, error } = await supabase
        .from('invites')
        .insert({
          company_id: id,
          email: `temp_${Date.now()}@company.com`,
          invited_by: profile.id,
          status: 'pending',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setInviteCodes(prev => [
        ...prev.map(code => 
          code.id === codeId ? { ...code, status: 'revoked' as const } : code
        ),
        { ...newCode, status: newCode.status as 'pending' | 'accepted' | 'revoked' | 'expired' }
      ]);
      
      toast({
        title: "Código regenerado",
        description: "Novo código de convite gerado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao regenerar código",
        description: error.message,
        variant: "destructive"
      });
    }
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
          
          <Button variant="outline" onClick={() => {
            const csvData = filteredCodes.map(code => ({
              Código: code.invite_code,
              Estado: code.status,
              'Utilizado Por': code.accepted_by || '—',
              Email: code.email || '—',
              'Data de Utilização': code.accepted_at || '—',
              'Data de Criação': code.created_at
            }));

            const csvContent = [
              Object.keys(csvData[0]).join(','),
              ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `convites_${company?.name}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            toast({
              title: "Exportação concluída",
              description: "Códigos de convite exportados com sucesso.",
            });
          }}>
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
                          {code.invite_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(code.invite_code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(code.status)}</TableCell>
                    <TableCell>
                      {code.accepted_by ? (
                        <div>
                          <div className="font-medium">{code.accepted_by}</div>
                          <div className="text-sm text-muted-foreground">{code.email || '—'}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(code.accepted_at)}</TableCell>
                    <TableCell>{formatDate(code.created_at)}</TableCell>
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