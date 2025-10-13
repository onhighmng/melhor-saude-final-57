import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  Building2, 
  Users, 
  Calendar, 
  Star, 
  Target,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Progress } from '@/components/ui/progress';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: analytics } = useAnalytics();

  // Mock data for charts
  const evolutionData = [
    { month: 'Ago', sessions: 245 },
    { month: 'Set', sessions: 312 },
    { month: 'Out', sessions: 389 },
    { month: 'Nov', sessions: 421 },
    { month: 'Dez', sessions: 478 },
    { month: 'Jan', sessions: 524 },
  ];

  const pillarData = [
    { name: 'Saúde Mental', value: 450 },
    { name: 'Bem-Estar Físico', value: 380 },
    { name: 'Assist. Financeira', value: 250 },
    { name: 'Assist. Jurídica', value: 190 },
  ];

  const metricCards = [
    {
      title: 'Empresas Ativas',
      value: analytics?.total_companies || 0,
      change: '+12%',
      trend: 'up',
      icon: Building2,
      color: 'text-vibrant-blue',
      bgColor: 'bg-vibrant-blue/10'
    },
    {
      title: 'Colaboradores Registados',
      value: analytics?.total_users || 0,
      subtitle: `${Math.round(((analytics?.active_users || 0) / (analytics?.total_users || 1)) * 100)}% onboarding completo`,
      progress: ((analytics?.active_users || 0) / (analytics?.total_users || 1)) * 100,
      icon: Users,
      color: 'text-mint-green',
      bgColor: 'bg-mint-green/10'
    },
    {
      title: 'Sessões Realizadas Este Mês',
      value: 524,
      change: '+9% vs mês anterior',
      progress: 75,
      icon: Calendar,
      color: 'text-royal-blue',
      bgColor: 'bg-royal-blue/10'
    },
    {
      title: 'Satisfação Média',
      value: '8.2/10',
      subtitle: 'Baseado em 342 avaliações',
      rating: 82,
      icon: Star,
      color: 'text-peach-orange',
      bgColor: 'bg-peach-orange/10'
    },
    {
      title: 'Objetivos Atingidos',
      value: '67%',
      subtitle: 'dos colaboradores',
      progress: 67,
      icon: Target,
      color: 'text-emerald-green',
      bgColor: 'bg-emerald-green/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-vibrant-blue/10 to-mint-green/10 rounded-2xl p-6 border border-vibrant-blue/20">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-1">
          Olá {profile?.name?.split(' ')[0] || 'Admin'}, bem-vindo de volta 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua plataforma hoje
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`${metric.bgColor} p-3 rounded-xl`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {metric.value}
                </div>
                
                {metric.change && (
                  <div className="flex items-center gap-1 text-sm">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-success' : 'text-destructive'}>
                      {metric.change}
                    </span>
                  </div>
                )}

                {metric.subtitle && !metric.progress && (
                  <p className="text-sm text-muted-foreground">
                    {metric.subtitle}
                  </p>
                )}

                {metric.progress !== undefined && (
                  <div className="space-y-2 mt-3">
                    <Progress value={metric.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {metric.subtitle || `${Math.round(metric.progress)}% completo`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Session Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-heading">Evolução de Sessões</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--vibrant-blue))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--vibrant-blue))', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Pillar Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-heading">Distribuição por Pilar</CardTitle>
            <p className="text-sm text-muted-foreground">Sessões por categoria</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pillarData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--mint-green))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
