import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
