import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AddCompanyModal } from '@/components/admin/AddCompanyModal';
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
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  const filteredCompanies = mockCompanies.filter(company =>
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
