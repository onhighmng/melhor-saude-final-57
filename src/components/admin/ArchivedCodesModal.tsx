import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Archive, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArchivedCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'hr' | 'affiliate'; // 'hr' for companies, 'affiliate' for prestador/specialist
}

export const ArchivedCodesModal = ({ open, onOpenChange, userType }: ArchivedCodesModalProps) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadArchivedCodes();
    }
  }, [open, userType]);

  const loadArchivedCodes = async () => {
    setLoading(true);
    try {
      const { data: allCodes, error } = await supabase
        .from('invites')
        .select('*')
        .eq('status', 'revoked')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on userType
      let filteredCodes = allCodes || [];
      if (userType === 'hr') {
        filteredCodes = filteredCodes.filter((code: any) => code.role === 'hr');
      } else {
        filteredCodes = filteredCodes.filter((code: any) => 
          code.role === 'prestador' || code.role === 'especialista_geral'
        );
      }

      setCodes(filteredCodes);
    } catch (error) {
      console.error('Error loading archived codes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar códigos arquivados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter(code => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      code.invite_code?.toLowerCase().includes(query) ||
      code.email?.toLowerCase().includes(query)
    );
  });

  const getUserTypeLabel = (role: string) => {
    const labels: Record<string, string> = {
      'hr': 'Responsável HR',
      'prestador': 'Prestador',
      'especialista_geral': 'Profesional de Permanencia'
    };
    return labels[role] || role;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Códigos Arquivados - {userType === 'hr' ? 'Empresas' : 'Affiliates'}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar por código ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum código arquivado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usado Por</TableHead>
                  {userType === 'hr' && <TableHead>Sessões</TableHead>}
                  <TableHead>Criado</TableHead>
                  <TableHead>Ativado</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {code.invite_code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getUserTypeLabel(code.role)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {code.email ? (
                        <span className="font-medium text-purple-700">{code.email}</span>
                      ) : (
                        <span className="text-gray-400">Não usado</span>
                      )}
                    </TableCell>
                    {userType === 'hr' && (
                      <TableCell className="text-sm font-semibold text-blue-600">
                        {code.sessions_allocated || 0}
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(code.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(code.accepted_at)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        Arquivado
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">
            Total de códigos arquivados: <span className="font-semibold">{filteredCodes.length}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};


