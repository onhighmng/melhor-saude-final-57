import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AddCompanyModal } from '@/components/admin/AddCompanyModal';
import { DeleteCompanyDialog } from '@/components/admin/DeleteCompanyDialog';
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
  Plus,
  Trash2
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
  const [companies, setCompanies] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Use external state if provided, otherwise use internal state
  const isAddCompanyModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

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
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar empresas';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
  
  const setIsAddCompanyModalOpen = externalSetIsOpen || setInternalIsOpen;

  const filteredCompanies = companies.filter(company =>
    (company.name as string).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.nuit as string).includes(searchQuery)
  );

  const navigate = useNavigate();

  const handleViewDetails = (company: Company) => {
    navigate(`/admin/companies/${company.id}`);
  };

  // Fetch monthly usage data
  const [monthlyUsageData, setMonthlyUsageData] = useState<Array<{ month: string; sessions: number }>>([]);

  useEffect(() => {
    const fetchMonthlyUsage = async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data, error } = await supabase
          .from('bookings')
          .select('booking_date')
          .gte('booking_date', sixMonthsAgo.toISOString())
          .order('booking_date', { ascending: true });

        if (error) throw error;

        // Group by month
        const monthCounts: Record<string, number> = {};
        data?.forEach(booking => {
          const date = new Date(booking.booking_date);
          const monthKey = date.toLocaleDateString('pt-PT', { month: 'short' });
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        });

        const chartData = Object.entries(monthCounts).map(([month, sessions]) => ({
          month,
          sessions
        }));

        setMonthlyUsageData(chartData);
      } catch (error) {
        // Silent fail for monthly usage fetching
      }
    };

    fetchMonthlyUsage();
  }, []);

  // Real-time subscription for companies
  useEffect(() => {
    const channel = supabase
      .channel('companies_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' },
        () => {
          loadCompanies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
                  <TableHead className="text-lg text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const usagePercent = ((company.usedSessions as number) / (company.totalSessions as number)) * 100;
                  return (
                    <TableRow 
                      key={company.id as string}
                      className="hover:bg-muted/50"
                    >
                      <TableCell 
                        className="font-medium text-lg py-4 cursor-pointer"
                        onClick={() => handleViewDetails(company as unknown as Company)}
                      >
                        {company.name as string}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-lg py-4">{company.nuit as string}</TableCell>
                      <TableCell className="text-lg py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          {company.employees as number}
                        </div>
                      </TableCell>
                      <TableCell className="text-lg py-4">
                        <span>
                          {company.usedSessions as number}/{company.totalSessions as number}
                        </span>
                      </TableCell>
                      <TableCell className="text-lg py-4">
                        <Badge 
                          variant={(company.status as string) === 'Ativa' ? 'default' : 'secondary'}
                          className={(company.status as string) === 'Ativa' ? 'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white border-0 text-base' : 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary text-base'}
                        >
                          {company.status as string}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(company as unknown as Company);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCompanyToDelete({ id: company.id as string, name: company.name as string });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

      {/* Delete Company Dialog */}
      {companyToDelete && (
        <DeleteCompanyDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          companyId={companyToDelete.id}
          companyName={companyToDelete.name}
          onSuccess={() => {
            setDeleteDialogOpen(false);
            setCompanyToDelete(null);
            loadCompanies();
          }}
        />
      )}
    </>
  );
};
