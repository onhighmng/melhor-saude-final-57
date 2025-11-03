import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Eye, 
  Building2, 
  Users, 
  Plus,
  Trash2
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  nuit: string;
  employees: number;
  plan: string;
  totalSessions: number;
  usedSessions: number;
  status: 'Ativa' | 'Em Onboarding';
  monthlyFee: number;
}

interface AdminCompaniesTabProps {
  onAddCompany?: () => void;
}

export const AdminCompaniesTab = ({ onAddCompany }: AdminCompaniesTabProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();

    // Real-time subscription
    const channel = supabase
      .channel('companies-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' },
        () => loadCompanies()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;

      if (companiesData) {
        // Filter companies: only show those with at least one active HR user
        const companiesWithHR = await Promise.all(
          companiesData.map(async (company) => {
            // Check if company has an active HR user
            const { data: hrUsers, error: hrError } = await supabase
              .from('profiles')
              .select('id')
              .eq('company_id', company.id)
              .eq('role', 'hr')
              .eq('is_active', true)
              .limit(1);

            // Skip companies without active HR users
            if (hrError || !hrUsers || hrUsers.length === 0) {
              return null;
            }

            // Get employee counts for each company
            const { count, error: countError } = await supabase
              .from('company_employees')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id);

            const employeeCount = countError ? 0 : (count || 0);

            return {
              id: company.id,
              name: company.name || 'N/A',
              nuit: company.nuit || 'N/A',
              employees: employeeCount,
              plan: company.plan_type || 'N/A',
              totalSessions: company.sessions_allocated || 0,
              usedSessions: company.sessions_used || 0,
              status: company.is_active ? 'Ativa' : 'Em Onboarding',
              monthlyFee: 0,
            };
          })
        );

        // Filter out null entries (companies without active HR)
        const validCompanies = companiesWithHR.filter(c => c !== null) as Company[];
        setCompanies(validCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Erro ao carregar empresas');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.nuit.includes(searchQuery)
  );

  const getCompanyColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[index % colors.length];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativa':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Ativa</Badge>;
      case 'Em Onboarding':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Em Onboarding</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar empresas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Companies List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-600">
            <div>Empresa</div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Colaboradores
            </div>
            <div>Sessões</div>
            <div>Estado</div>
          </div>

          {/* Companies Rows */}
          <div className="divide-y">
            {filteredCompanies.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma empresa encontrada</p>
              </div>
            ) : (
              filteredCompanies.map((company, index) => (
                <div 
                  key={company.id} 
                  className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Company Name */}
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getCompanyColor(index)}`}>
                      {company.name}
                    </div>
                  </div>

                  {/* Employees */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{company.employees}</span>
                  </div>

                  {/* Sessions */}
                  <div className="text-sm">
                    <span className="font-medium">{company.usedSessions}</span>
                    <span className="text-gray-400">/{company.totalSessions}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(company.status)}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Como Adicionar Empresas</h4>
            <p className="text-sm text-blue-700 mt-1">
              Para permitir que novas empresas se registem, gere códigos HR no botão "Gerar HR" abaixo. 
              Os responsáveis de empresa usarão esses códigos para registar a sua empresa na plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};