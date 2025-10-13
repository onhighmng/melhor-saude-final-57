import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Calendar, 
  Star, 
  Target,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: analytics } = useAnalytics();
  const navigate = useNavigate();

  // Mock data for charts
  const sessionEvolutionData = [
    { month: 'Jan', sessions: 120 },
    { month: 'Fev', sessions: 145 },
    { month: 'Mar', sessions: 180 },
    { month: 'Abr', sessions: 220 },
    { month: 'Mai', sessions: 195 },
    { month: 'Jun', sessions: 240 },
  ];

  const pillarDistributionData = [
    { pillar: 'Psicológico', sessions: 85 },
    { pillar: 'Físico', sessions: 65 },
    { pillar: 'Financeiro', sessions: 45 },
    { pillar: 'Jurídico', sessions: 45 },
  ];

  const metricCards = [
    {
      title: 'Empresas Ativas',
      value: analytics?.total_companies || 0,
      trend: '+12%',
      isPositive: true,
      icon: Building2,
      iconColor: 'text-vibrant-blue',
      bgColor: 'bg-vibrant-blue/10',
      route: '/admin/users-management'
    },
    {
      title: 'Colaboradores Registados',
      value: analytics?.total_users || 0,
      progress: 78,
      progressLabel: '78% onboarding completo',
      icon: Users,
      iconColor: 'text-emerald-green',
      bgColor: 'bg-emerald-green/10',
      route: '/admin/users-management'
    },
    {
      title: 'Sessões Este Mês',
      value: analytics?.total_bookings || 0,
      trend: '+8%',
      isPositive: true,
      icon: Calendar,
      iconColor: 'text-accent-sky',
      bgColor: 'bg-accent-sky/10',
      route: '/admin/operations'
    },
    {
      title: 'Satisfação Média',
      value: '8.2/10',
      progress: 82,
      icon: Star,
      iconColor: 'text-peach-orange',
      bgColor: 'bg-peach-orange/10',
      route: '/admin/resources?tab=resultados'
    },
    {
      title: 'Faturação',
      value: '€24,500',
      trend: '+15%',
      isPositive: true,
      icon: Target,
      iconColor: 'text-royal-blue',
      bgColor: 'bg-royal-blue/10',
      route: '/admin/reports?tab=billing'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-vibrant-blue/10 via-accent-sky/10 to-emerald-green/10 rounded-lg p-6 border border-border">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          Olá {profile?.name?.split(' ')[0] || 'Admin'}, bem-vindo de volta 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da plataforma Melhor Saúde
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metricCards.map((metric, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => navigate(metric.route)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                
                {metric.trend && (
                  <div className="flex items-center gap-1 text-sm">
                    {metric.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-emerald-green" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={metric.isPositive ? 'text-emerald-green' : 'text-destructive'}>
                      {metric.trend}
                    </span>
                    <span className="text-muted-foreground">vs mês anterior</span>
                  </div>
                )}

                {metric.progress !== undefined && (
                  <div className="space-y-2">
                    <Progress value={metric.progress} className="h-2" />
                    {metric.progressLabel && (
                      <p className="text-xs text-muted-foreground">{metric.progressLabel}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session Evolution Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Evolução de Sessões
            </CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--vibrant-blue))" 
                  strokeWidth={2}
                  name="Sessões"
                  dot={{ fill: 'hsl(var(--vibrant-blue))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pillar Distribution Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Distribuição por Pilar
            </CardTitle>
            <p className="text-sm text-muted-foreground">Sessões por área</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pillarDistributionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="pillar" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sessions" 
                  fill="hsl(var(--emerald-green))"
                  name="Sessões"
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
