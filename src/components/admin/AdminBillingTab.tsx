import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BillingRecord {
  id: string;
  company: string;
  amountBilled: number;
  sessionsUsed: number;
  margin: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

const AdminBillingTab = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [revenueByPillar, setRevenueByPillar] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      // Load companies with bookings
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          company_name,
          sessions_allocated,
          sessions_used
        `);

      if (companiesError) throw companiesError;

      // Load subscriptions for payment status
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('company_id, status');

      if (subsError) throw subsError;

      const subscriptionMap = new Map(subscriptions?.map(s => [s.company_id, s.status]) || []);

      // Calculate billing data
      const billingRecords: BillingRecord[] = (companies || []).map(company => {
        const sessionPrice = 150; // MZN per session
        const amountBilled = (company.sessions_used || 0) * sessionPrice;
        const costPerSession = sessionPrice * 0.65; // 65% cost
        const margin = ((sessionPrice - costPerSession) / sessionPrice) * 100;

        const subscriptionStatus = subscriptionMap.get(company.id) || 'pending';
        let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
        
        if (subscriptionStatus === 'active') paymentStatus = 'paid';
        else if (subscriptionStatus === 'past_due') paymentStatus = 'overdue';

        return {
          id: company.id,
          company: company.company_name || 'N/A',
          amountBilled,
          sessionsUsed: company.sessions_used || 0,
          margin: Math.round(margin),
          paymentStatus
        };
      });

      setBillingData(billingRecords);

      // Calculate revenue by pillar
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('pillar');

      if (bookingsError) throw bookingsError;

      const pillarRevenue = new Map<string, number>();
      bookings?.forEach(booking => {
        if (booking.pillar) {
          const revenue = pillarRevenue.get(booking.pillar) || 0;
          pillarRevenue.set(booking.pillar, revenue + sessionPrice);
        }
      });

      const pillarColors: Record<string, string> = {
        'psychological': '#8B5CF6',
        'physical': '#10B981',
        'financial': '#F59E0B',
        'legal': '#3B82F6'
      };

      const pillarLabels: Record<string, string> = {
        'psychological': 'Saúde Mental',
        'physical': 'Bem-estar Físico',
        'financial': 'Assistência Financeira',
        'legal': 'Assistência Jurídica'
      };

      const pillarData = Array.from(pillarRevenue.entries()).map(([pillar, value]) => ({
        name: pillarLabels[pillar] || pillar,
        value,
        color: pillarColors[pillar] || '#8884d8'
      }));

      setRevenueByPillar(pillarData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: 'Erro ao carregar dados de faturação',
        description: 'Não foi possível carregar os dados de faturação.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = billingData.filter(record =>
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

  const totalRevenue = billingData.reduce((sum, record) => sum + record.amountBilled, 0);
  const totalSessions = billingData.reduce((sum, record) => sum + record.sessionsUsed, 0);
  const averageMargin = billingData.length > 0 
    ? billingData.reduce((sum, record) => sum + record.margin, 0) / billingData.length 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium animate-pulse bg-gray-200 h-4 w-24 rounded" />
                <div className="h-4 w-4 animate-pulse bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-pulse bg-gray-200 h-8 w-32 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">MZN {totalRevenue.toLocaleString()}</div>
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
            <div className="font-mono text-xl font-semibold">{averageMargin.toFixed(1)}%</div>
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
                      <TableCell>MZN {record.amountBilled.toLocaleString()}</TableCell>
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
                <Tooltip formatter={(value) => `MZN ${Number(value).toLocaleString()}`} />
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
