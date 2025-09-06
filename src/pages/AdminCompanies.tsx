import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Search, 
  Plus, 
  Download, 
  Building2, 
  Users, 
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Power,
  PowerOff,
  Settings,
  Globe,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Mail
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { mockCompanies } from '@/data/companyMockData';
import { SeatLimitEditor } from '@/components/admin/SeatLimitEditor';

interface Company {
  id: string;
  name: string;
  domain: string;
  users_count: number;
  quota_usage: number;
  plan: string;
  status: 'active' | 'inactive';
  contact_email?: string;
  contact_phone?: string;
  sessions_allocated?: number;
  sessions_used?: number;
  region?: string;
  pillars?: string[];
}

interface CompanyDetail {
  id: string;
  name: string;
  domain: string;
  quotas: number;
  activePillars: {
    mentalHealth: boolean;
    physicalWellness: boolean;
    financialAssistance: boolean;
    legalAssistance: boolean;
  };
  region: string;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
}

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDetail, setCompanyDetail] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCompanyForChart, setSelectedCompanyForChart] = useState<Company | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Using the imported mock data instead of redefining
  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    // Filter companies based on search query
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companies, searchQuery]);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      // Convert imported mock data to match the expected interface
      const adaptedMockData: Company[] = mockCompanies.map(company => ({
        id: company.id,
        name: company.name,
        domain: `${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        users_count: company.seatUsed,
        quota_usage: Math.round((company.seatUsed / company.seatLimit) * 100),
        plan: company.planType === 'basic' ? 'Free' : company.planType === 'premium' ? 'Standard' : 'Enterprise',
        status: company.seatUsed > 0 ? 'active' : 'inactive',
        contact_email: company.contactEmail,
        contact_phone: company.contactPhone,
        sessions_allocated: company.seatLimit * 12,
        sessions_used: company.seatUsed * 8,
        region: 'PT',
        pillars: ['mental-health', 'physical-wellness']
      }));

      setTimeout(() => {
        setCompanies(adaptedMockData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (company: Company) => {
    setSelectedCompany(company);
    
    // Find the corresponding company in the original mock data for user details
    const originalCompany = mockCompanies.find(mc => mc.id === company.id);
    
    const adaptedCompanyDetail: CompanyDetail = {
      id: company.id,
      name: company.name,
      domain: company.domain,
      quotas: company.sessions_allocated || 0,
      activePillars: {
        mentalHealth: true,
        physicalWellness: true,
        financialAssistance: false,
        legalAssistance: true
      },
      region: company.region || 'PT',
      users: originalCompany ? originalCompany.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      })) : []
    };
    
    setCompanyDetail(adaptedCompanyDetail);
    setShowDetailDialog(true);
  };


  const handleStatusChange = async (companyId: string, newStatus: 'active' | 'inactive') => {
    try {
      // Replace with actual API call
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, status: newStatus }
          : company
      ));
      
      toast({
        title: newStatus === 'active' ? "Empresa ativada" : "Empresa suspensa",
        description: "Status atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da empresa",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    // Mock export functionality
    toast({
      title: "Exportação iniciada",
      description: "Os dados serão exportados em breve"
    });
  };

  // Calculate summary metrics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalUsers = companies.reduce((sum, c) => sum + c.users_count, 0);
  const avgQuotaUsage = companies.length > 0 
    ? Math.round(companies.reduce((sum, c) => sum + c.quota_usage, 0) / companies.length)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, string> = {
      'Free': 'secondary',
      'Standard': 'outline',
      'Enterprise': 'default'
    };
    return <Badge variant={variants[plan] as any}>{plan}</Badge>;
  };

  // Usage data for pie chart
  const usageData = selectedCompanyForChart 
    ? [
        { name: 'Usado', value: selectedCompanyForChart.quota_usage, color: 'hsl(var(--primary))' },
        { name: 'Disponível', value: 100 - selectedCompanyForChart.quota_usage, color: 'hsl(var(--muted))' }
      ]
    : [
        { name: 'Usado', value: avgQuotaUsage, color: 'hsl(var(--primary))' },
        { name: 'Disponível', value: 100 - avgQuotaUsage, color: 'hsl(var(--muted))' }
      ];

  const chartTitle = selectedCompanyForChart 
    ? `${selectedCompanyForChart.name} - Uso de Quotas`
    : 'Uso Médio de Quotas';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
            <p className="text-sm text-muted-foreground">Gestão multi-tenant de empresas</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome ou domínio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Empresa
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 inline text-green-600" />
                <span className="text-green-600">+3</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Empresas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeCompanies}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((activeCompanies / totalCompanies) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Utilizadores Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 inline text-green-600" />
                <span className="text-green-600">+12%</span> vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Uso Médio de Quotas (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgQuotaUsage}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${avgQuotaUsage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Companies Table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-foreground">Lista de Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      const sorted = [...filteredCompanies].sort((a, b) => a.name.localeCompare(b.name));
                      setFilteredCompanies(sorted);
                    }}>
                      Empresa ↕
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      const sorted = [...filteredCompanies].sort((a, b) => a.domain.localeCompare(b.domain));
                      setFilteredCompanies(sorted);
                    }}>
                      Domínio ↕
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      const sorted = [...filteredCompanies].sort((a, b) => b.users_count - a.users_count);
                      setFilteredCompanies(sorted);
                    }}>
                      Utilizadores ↕
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      const sorted = [...filteredCompanies].sort((a, b) => b.quota_usage - a.quota_usage);
                      setFilteredCompanies(sorted);
                    }}>
                      Uso Quotas ↕
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      const sorted = [...filteredCompanies].sort((a, b) => a.plan.localeCompare(b.plan));
                      setFilteredCompanies(sorted);
                    }}>
                      Plano ↕
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      const sorted = [...filteredCompanies].sort((a, b) => a.status.localeCompare(b.status));
                      setFilteredCompanies(sorted);
                    }}>
                      Estado ↕
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Nenhuma empresa encontrada.' : 'Carregando empresas...'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {company.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{company.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{company.domain}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{company.users_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={company.quota_usage} className="w-16 h-2" />
                            <span className="text-sm">{company.quota_usage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(company.plan)}</TableCell>
                        <TableCell>{getStatusBadge(company.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(company)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Use the same detailed data as the view button for consistency
                                handleViewDetails(company);
                              }}
                              title="Editar empresa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Navigate to invite codes page or show invite modal
                                toast({
                                  title: "Códigos de Convite",
                                  description: `Gestão de códigos para ${company.name} será implementada em breve.`
                                });
                              }}
                              title="Gerir códigos de convite"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(
                                company.id, 
                                company.status === 'active' ? 'inactive' : 'active'
                              )}
                              title={company.status === 'active' ? 'Desativar' : 'Ativar'}
                            >
                              {company.status === 'active' ? (
                                <Power className="h-4 w-4 text-green-500" />
                              ) : (
                                <PowerOff className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Usage Visualization */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">{chartTitle}</CardTitle>
              {selectedCompanyForChart && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCompanyForChart(null)}
                  className="text-xs"
                >
                  Ver Geral
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!selectedCompanyForChart && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Selecione uma empresa:</p>
                    <Select onValueChange={(value) => {
                      const company = companies.find(c => c.id === value);
                      setSelectedCompanyForChart(company || null);
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Escolher empresa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {usageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentagem']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {selectedCompanyForChart && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilizadores:</span>
                      <span className="font-medium">{selectedCompanyForChart.users_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano:</span>
                      <span className="font-medium">{selectedCompanyForChart.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sessões Usadas:</span>
                      <span className="font-medium">{selectedCompanyForChart.sessions_used || 0}/{selectedCompanyForChart.sessions_allocated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedCompanyForChart.status)}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm">Usado</span>
                  </div>
                  <span className="text-sm font-medium">{avgQuotaUsage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-sm">Disponível</span>
                  </div>
                  <span className="text-sm font-medium">{100 - avgQuotaUsage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Company Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhe da Empresa - {companyDetail?.name}</DialogTitle>
          </DialogHeader>
          
          {companyDetail && (
            <div className="space-y-6">
              {/* Settings Section */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Definições
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quotas de Sessões</Label>
                    <Input value={companyDetail.quotas} type="number" className="mt-1" />
                  </div>
                  <div>
                    <Label>Região de Dados</Label>
                    <Select value={companyDetail.region}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PT">Portugal</SelectItem>
                        <SelectItem value="EU">Europa</SelectItem>
                        <SelectItem value="US">Estados Unidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Active Pillars */}
              <div>
                <h4 className="text-sm font-medium mb-3">Pilares Ativos</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Saúde Mental</Label>
                    <Switch checked={companyDetail.activePillars.mentalHealth} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bem-Estar Físico</Label>
                    <Switch checked={companyDetail.activePillars.physicalWellness} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Assistência Financeira</Label>
                    <Switch checked={companyDetail.activePillars.financialAssistance} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Assistência Jurídica</Label>
                    <Switch checked={companyDetail.activePillars.legalAssistance} />
                  </div>
                </div>
              </div>

              {/* Users Preview */}
              <div>
                <h4 className="text-sm font-medium mb-3">Utilizadores ({companyDetail.users.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {companyDetail.users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Toggle user status
                            const newStatus = user.isActive ? 'inactive' : 'active';
                            toast({
                              title: newStatus === 'active' ? "Utilizador ativado" : "Utilizador desativado",
                              description: `Status de ${user.name} atualizado`
                            });
                          }}
                        >
                          {user.isActive ? (
                            <Power className="h-4 w-4 text-green-500" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Save changes logic here
                  toast({
                    title: "Alterações guardadas",
                    description: `As definições da empresa ${companyDetail.name} foram atualizadas.`
                  });
                  setShowDetailDialog(false);
                }}>
                  Guardar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanies;