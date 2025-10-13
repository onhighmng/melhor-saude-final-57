import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Eye, 
  Building2, 
  Users, 
  TrendingUp,
  Calendar,
  Euro
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

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Lda',
    nuit: '501234567',
    employees: 45,
    plan: '400 sessões',
    totalSessions: 400,
    usedSessions: 287,
    status: 'Ativa',
    monthlyFee: 2500
  },
  {
    id: '2',
    name: 'HealthPlus SA',
    nuit: '502345678',
    employees: 120,
    plan: '1000 sessões',
    totalSessions: 1000,
    usedSessions: 823,
    status: 'Ativa',
    monthlyFee: 6000
  },
  {
    id: '3',
    name: 'StartupHub',
    nuit: '503456789',
    employees: 15,
    plan: '150 sessões',
    totalSessions: 150,
    usedSessions: 45,
    status: 'Em Onboarding',
    monthlyFee: 1200
  },
  {
    id: '4',
    name: 'ConsultPro',
    nuit: '504567890',
    employees: 80,
    plan: '600 sessões',
    totalSessions: 600,
    usedSessions: 512,
    status: 'Ativa',
    monthlyFee: 3800
  },
];

export const AdminCompaniesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.nuit.includes(searchQuery)
  );

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setSheetOpen(true);
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

  return (
    <>
      <div className="space-y-6">
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
            <CardTitle>Empresas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>NUIT</TableHead>
                  <TableHead>Colaboradores</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const usagePercent = (company.usedSessions / company.totalSessions) * 100;
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-muted-foreground">{company.nuit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {company.employees}
                        </div>
                      </TableCell>
                      <TableCell>{company.plan}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {company.usedSessions}/{company.totalSessions}
                            </span>
                            <span className={`font-medium ${usagePercent > 80 ? 'text-destructive' : 'text-success'}`}>
                              {company.totalSessions - company.usedSessions} restantes
                            </span>
                          </div>
                          <Progress value={usagePercent} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={company.status === 'Ativa' ? 'default' : 'secondary'}
                          className={company.status === 'Ativa' ? 'bg-success' : ''}
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(company)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedCompany && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedCompany.name}
                </SheetTitle>
                <SheetDescription>
                  Informações detalhadas da empresa
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-vibrant-blue/10 rounded-lg">
                          <Users className="h-5 w-5 text-vibrant-blue" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Colaboradores</p>
                          <p className="text-2xl font-bold">{selectedCompany.employees}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-mint-green/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-mint-green" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Uso do Plano</p>
                          <p className="text-2xl font-bold">
                            {Math.round((selectedCompany.usedSessions / selectedCompany.totalSessions) * 100)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NUIT</span>
                      <span className="font-medium">{selectedCompany.nuit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano</span>
                      <span className="font-medium">{selectedCompany.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <Badge variant={selectedCompany.status === 'Ativa' ? 'default' : 'secondary'}>
                        {selectedCompany.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uso Mensal de Sessões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyUsageData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="sessions" fill="hsl(var(--vibrant-blue))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Billing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Faturação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mensalidade</span>
                      <span className="font-bold text-lg">MZN {selectedCompany.monthlyFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Próxima faturação</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        01/02/2025
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
