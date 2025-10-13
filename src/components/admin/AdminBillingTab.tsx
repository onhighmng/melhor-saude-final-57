import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Search, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface BillingRecord {
  id: string;
  company: string;
  amountBilled: number;
  sessionsUsed: number;
  margin: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

const mockBillingData: BillingRecord[] = [
  { id: '1', company: 'TechCorp', amountBilled: 45000, sessionsUsed: 350, margin: 35, paymentStatus: 'paid' },
  { id: '2', company: 'InnovaSolutions', amountBilled: 32000, sessionsUsed: 250, margin: 42, paymentStatus: 'paid' },
  { id: '3', company: 'GlobalFinance', amountBilled: 28000, sessionsUsed: 220, margin: 38, paymentStatus: 'pending' },
  { id: '4', company: 'StartupHub', amountBilled: 15000, sessionsUsed: 120, margin: 30, paymentStatus: 'paid' },
  { id: '5', company: 'Enterprise Co', amountBilled: 22000, sessionsUsed: 180, margin: 40, paymentStatus: 'overdue' },
];

const revenueByPillar = [
  { name: 'Saúde Mental', value: 45000, color: '#8B5CF6' },
  { name: 'Bem-estar Físico', value: 35000, color: '#10B981' },
  { name: 'Assistência Financeira', value: 28000, color: '#F59E0B' },
  { name: 'Assistência Jurídica', value: 22000, color: '#3B82F6' },
];

const AdminBillingTab = () => {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = mockBillingData.filter(record =>
    record.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      overdue: 'destructive',
    };
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Atrasado',
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const totalRevenue = mockBillingData.reduce((sum, record) => sum + record.amountBilled, 0);
  const totalSessions = mockBillingData.reduce((sum, record) => sum + record.sessionsUsed, 0);
  const averageMargin = mockBillingData.reduce((sum, record) => sum + record.margin, 0) / mockBillingData.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Faturadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Última atualização: hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.5% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Billing Table */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Faturação por Empresa</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Procurar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Sessões</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.company}</TableCell>
                      <TableCell>€{record.amountBilled.toLocaleString()}</TableCell>
                      <TableCell>{record.sessionsUsed}</TableCell>
                      <TableCell>{record.margin}%</TableCell>
                      <TableCell>{getPaymentStatusBadge(record.paymentStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribuição da Receita por Pilar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={revenueByPillar}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByPillar.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBillingTab;
