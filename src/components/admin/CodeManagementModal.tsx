import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Trash2, Clock, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserType, AccessCode } from '@/types/accessCodes';

interface CodeManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: UserType;
  title: string;
}

export const CodeManagementModal = ({
  open,
  onOpenChange,
  userType,
  title
}: CodeManagementModalProps) => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCodes();
    }
  }, [open, userType]);

  useEffect(() => {
    filterCodes();
  }, [codes, searchQuery, statusFilter]);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          id,
          invite_code,
          user_type,
          company_id,
          expires_at,
          status,
          created_by,
          metadata,
          created_at,
          companies(company_name)
        `)
        .eq('user_type', userType)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCodes: AccessCode[] = (data || []).map(code => ({
        id: code.id,
        invite_code: code.invite_code,
        user_type: code.user_type as UserType,
        company_id: code.company_id,
        expires_at: code.expires_at,
        status: code.status as 'pending' | 'used' | 'expired' | 'revoked',
        created_by: code.created_by,
        metadata: code.metadata || {},
        created_at: code.created_at,
        company_name: (code.companies as any)?.company_name
      }));

      setCodes(formattedCodes);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar códigos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCodes = () => {
    let filtered = codes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(code =>
        code.invite_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(code => code.status === statusFilter);
    }

    setFilteredCodes(filtered);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência',
    });
  };

  const revokeCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: 'Código Revogado',
        description: 'O código foi revogado com sucesso',
      });

      loadCodes();
    } catch (error) {
      console.error('Error revoking code:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao revogar código',
        variant: 'destructive'
      });
    }
  };

  const extendExpiry = async (codeId: string) => {
    try {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 30);

      const { error } = await supabase
        .from('invites')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: 'Expiração Estendida',
        description: 'A expiração foi estendida por 30 dias',
      });

      loadCodes();
    } catch (error) {
      console.error('Error extending expiry:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao estender expiração',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-700">Usado</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700">Expirado</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-700">Revogado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestão de Códigos - {title}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar códigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Ativos</SelectItem>
              <SelectItem value="used">Usados</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="revoked">Revogados</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={loadCodes}
            disabled={loading}
            className="px-4"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando códigos...
                  </TableCell>
                </TableRow>
              ) : filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum código encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">
                      {code.invite_code}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(code.status)}
                    </TableCell>
                    <TableCell>
                      {code.company_name || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(code.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className={`${isExpired(code.expires_at) ? 'text-red-600' : ''}`}>
                        {formatDate(code.expires_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.invite_code)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {code.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => extendExpiry(code.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeCode(code.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {filteredCodes.length} de {codes.length} códigos
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
