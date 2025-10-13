import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const revenueData = [
  { month: 'Maio', revenue: 98000, sessions: 780, margin: 36 },
  { month: 'Jun', revenue: 105000, sessions: 820, margin: 37 },
  { month: 'Jul', revenue: 112000, sessions: 890, margin: 38 },
  { month: 'Ago', revenue: 108000, sessions: 850, margin: 37 },
  { month: 'Set', revenue: 118000, sessions: 920, margin: 39 },
  { month: 'Out', revenue: 130000, sessions: 1020, margin: 40 },
];

const sessionsComparisonData = [
  { month: 'Maio', mentalHealth: 320, physical: 240, financial: 140, legal: 80 },
  { month: 'Jun', mentalHealth: 340, physical: 250, financial: 150, legal: 80 },
  { month: 'Jul', mentalHealth: 360, physical: 280, financial: 160, legal: 90 },
  { month: 'Ago', mentalHealth: 350, physical: 260, financial: 155, legal: 85 },
  { month: 'Set', mentalHealth: 380, physical: 290, financial: 165, legal: 85 },
  { month: 'Out', mentalHealth: 420, physical: 310, financial: 180, legal: 110 },
];

const AdminInternalReportsTab = () => {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6">
      {/* Period Indicator */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Período de Análise</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Últimos 6 Meses</div>
          <p className="text-xs text-muted-foreground">Maio 2024 - Outubro 2024</p>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução da Faturação</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+32.6% vs período anterior</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" name="Receita (€)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sessions Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Sessões por Pilar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sessionsComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mentalHealth" fill="#8B5CF6" name="Saúde Mental" />
              <Bar dataKey="physical" fill="#10B981" name="Bem-estar Físico" />
              <Bar dataKey="financial" fill="#F59E0B" name="Assistência Financeira" />
              <Bar dataKey="legal" fill="#3B82F6" name="Assistência Jurídica" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Margins Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Margens</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="margin" stroke="#10B981" name="Margem (%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInternalReportsTab;
