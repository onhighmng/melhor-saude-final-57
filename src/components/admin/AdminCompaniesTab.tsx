import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AddCompanyModal } from '@/components/admin/AddCompanyModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Eye, 
  Building2, 
  Users, 
  TrendingUp,
  Calendar,
  Euro,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

// Mock companies removed - using real data from database

export const AdminCompaniesTab = ({ 
  isAddCompanyModalOpen: externalIsOpen,
  setIsAddCompanyModalOpen: externalSetIsOpen
}: {
  isAddCompanyModalOpen?: boolean;
  setIsAddCompanyModalOpen?: (open: boolean) => void;
} = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use external state if provided, otherwise use internal state
  const isAddCompanyModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select(`
            *,
            company_employees (count)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedCompanies = data.map(company => {
            const employeeCount = company.company_employees?.length || 0;
            const usagePercent = company.sessions_allocated > 0 
              ? Math.round((company.sessions_used / company.sessions_allocated) * 100)
              : 0;
            
            return {
              id: company.id,
              name: company.company_name,
              nuit: '',
              employees: employeeCount,
              plan: `${company.sessions_allocated} sessões`,
              totalSessions: company.sessions_allocated,
              usedSessions: company.sessions_used,
              status: company.is_active ? 'Ativa' : 'Em Onboarding',
              monthlyFee: 0
            };
          });

          setCompanies(formattedCompanies);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
        toast.error('Erro ao carregar empresas');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);
  const setIsAddCompanyModalOpen = externalSetIsOpen || setInternalIsOpen;

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.nuit.includes(searchQuery)
  );

  const navigate = useNavigate();

  const handleViewDetails = (company: Company) => {
    navigate(`/admin/companies/${company.id}`);
  };

  // Mock data para gráfico de uso mensal
  const monthlyUsageData = [
    { month: 'Jan', sessions: 45 },
    { month: 'Fev', sessions: 52 },
    { month: 'Mar', sessions: 67 },
    { month: 'Abr', sessions: 58 },
    { month: 'Mai', sessions: 72 },
    { month: 'Jun', sessions: 65 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Empresas</h2>
            <p className="text-sm text-muted-foreground">Gerir empresas e planos de sessões</p>
          </div>
          
          <Button onClick={() => setIsAddCompanyModalOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Empresa
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome ou NUIT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Empresas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg">Empresa</TableHead>
                  <TableHead className="text-lg">NUIT</TableHead>
                  <TableHead className="text-lg">Colaboradores</TableHead>
                  <TableHead className="text-lg">Sessões</TableHead>
                  <TableHead className="text-lg">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const usagePercent = (company.usedSessions / company.totalSessions) * 100;
                  return (
                    <TableRow 
                      key={company.id}
                      onClick={() => handleViewDetails(company)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-lg py-4">{company.name}</TableCell>
                      <TableCell className="text-muted-foreground text-lg py-4">{company.nuit}</TableCell>
                      <TableCell className="text-lg py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          {company.employees}
                        </div>
                      </TableCell>
                      <TableCell className="text-lg py-4">
                        <span>
                          {company.usedSessions}/{company.totalSessions}
                        </span>
                      </TableCell>
                      <TableCell className="text-lg py-4">
                        <Badge 
                          variant={company.status === 'Ativa' ? 'default' : 'secondary'}
                          className={company.status === 'Ativa' ? 'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white border-0 text-base' : 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary text-base'}
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Company Modal */}
      <AddCompanyModal
        open={isAddCompanyModalOpen}
        onOpenChange={setIsAddCompanyModalOpen}
      />
    </>
  );
};
