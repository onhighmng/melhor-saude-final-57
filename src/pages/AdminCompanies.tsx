import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Building2, TrendingUp, Edit2, Check, X, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AddCompanyModal } from '@/components/admin/AddCompanyModal';

interface Company {
  id: string;
  name: string;
  email: string;
  employee_seats: number;
  sessions_allocated: number;
  sessions_used: number;
  is_active: boolean;
  plan_type: string;
  created_at: string;
}

interface CompanySeatStats {
  employee_seats: number;
  active_employees: number;
  pending_invites: number;
  total_used_seats: number;
  available_seats: number;
  sessions_allocated: number;
  sessions_used: number;
  sessions_available: number;
}

export default function AdminCompanies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySeatStats, setCompanySeatStats] = useState<Map<string, CompanySeatStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<{ id: string; seats: number } | null>(null);
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies((data || []) as unknown as Company[]);

      // Load seat stats for each company using RPC function
      const statsMap = new Map<string, CompanySeatStats>();
      for (const company of data || []) {
        try {
          const { data: stats } = await supabase
            .rpc('get_company_seat_stats' as any, { p_company_id: company.id })
            .single();
          
          if (stats) {
            statsMap.set(company.id, stats as CompanySeatStats);
          }
        } catch (err) {
          // Continue if one company fails
          console.error(`Failed to load stats for company ${company.id}:`, err);
        }
      }
      setCompanySeatStats(statsMap);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar empresas';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeats = async (companyId: string, newSeats: number) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          employee_seats: newSeats,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      // Reload companies to get fresh data
      await loadCompanies();
      
      toast.success('Limite de lugares atualizado com sucesso');
      setEditingCompany(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar limite';
      toast.error(errorMessage);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCompanies = companies.length;
  const totalEmployeeSeats = companies.reduce((sum, c) => sum + (c.employee_seats || 0), 0);
  const totalActiveEmployees = Array.from(companySeatStats.values()).reduce((sum, stats) => sum + (stats.active_employees || 0), 0);
  const totalPendingInvites = Array.from(companySeatStats.values()).reduce((sum, stats) => sum + (stats.pending_invites || 0), 0);
  const activeCompanies = companies.filter(c => c.is_active).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gerir empresas e alocação de vagas</p>
        </div>
        <Button onClick={() => setAddCompanyModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total de Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeCompanies} ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Lugares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalEmployeeSeats}</div>
            <p className="text-xs text-muted-foreground mt-1">Capacidade total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalActiveEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Contas criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Convites Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalPendingInvites}</div>
            <p className="text-xs text-muted-foreground mt-1">Códigos gerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar empresas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"

          />
        </div>
      </div>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Lugares (Limite)</TableHead>
                <TableHead>Ativos</TableHead>
                <TableHead>Pendentes</TableHead>
                <TableHead>Disponíveis</TableHead>
                <TableHead>Utilização</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma empresa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => {
                  const stats = companySeatStats.get(company.id);
                  const usagePercent = stats && stats.employee_seats > 0 
                    ? Math.round((stats.total_used_seats / stats.employee_seats) * 100)
                    : 0;
                  const isLowSeats = stats && stats.available_seats <= 5 && stats.available_seats > 0;
                  const isZeroSeats = stats && stats.available_seats <= 0;
                  const isEditing = editingCompany?.id === company.id;
                  
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.email}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={editingCompany.seats}
                              onChange={(e) => setEditingCompany({ ...editingCompany, seats: parseInt(e.target.value) || 0 })}
                              className="w-20"

                            />
                            <Button
                              size="sm"
                                variant="ghost"
                              onClick={() => handleUpdateSeats(company.id, editingCompany.seats)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                                variant="ghost"
                              onClick={() => setEditingCompany(null)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{company.employee_seats || 0}</span>
                            <Button
                              size="sm"
                                variant="ghost"
                              onClick={() => setEditingCompany({ id: company.id, seats: company.employee_seats || 0 })}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {stats?.active_employees || 0}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-amber-600">
                          {stats?.pending_invites || 0}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className={`font-medium ${isZeroSeats ? 'text-red-600' : isLowSeats ? 'text-amber-600' : 'text-blue-600'}`}>
                          {stats?.available_seats || 0}
                          {isZeroSeats && <AlertCircle className="h-3 w-3 inline ml-1" />}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{usagePercent}%</span>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                usagePercent >= 90 ? 'bg-red-500' :
                                usagePercent >= 70 ? 'bg-amber-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}

                            />
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={company.is_active ? 'secondary' : 'destructive'}>
                          {company.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Link to={`/admin/companies/${company.id}`}>
                          <Button variant="outline" size="sm">
                            Detalhes
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Company Modal */}
      <AddCompanyModal
        open={addCompanyModalOpen}
        onOpenChange={setAddCompanyModalOpen}
        onSuccess={loadCompanies}
      />
    </div>
  );
}
