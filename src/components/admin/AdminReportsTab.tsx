import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  Download, 
  FileText,
  Building2,
  Target,
  Star,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pillar, PILLAR_DISPLAY_NAMES } from '@/integrations/supabase/types-unified';

interface CompanyStats {
  id: string;
  name: string;
  sessions_allocated: number;
  sessions_used: number;
  employees_count: number;
  active_users: number;
  satisfaction_avg: number;
  utilization_rate: number;
}

interface PillarStats {
  pillar: Pillar;
  sessions_count: number;
  satisfaction_avg: number;
  completion_rate: number;
  users_count: number;
}

interface MonthlyStats {
  month: string;
  sessions_used: number;
  new_users: number;
  satisfaction_avg: number;
  revenue: number;
}

interface GoalStats {
  pillar: Pillar;
  goals_set: number;
  goals_achieved: number;
  achievement_rate: number;
}

export const AdminReportsTab: React.FC = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [pillarStats, setPillarStats] = useState<PillarStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [goalStats, setGoalStats] = useState<GoalStats[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCompanyStats(),
        loadPillarStats(),
        loadMonthlyStats(),
        loadGoalStats()
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar relatórios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyStats = async () => {
    const days = parseInt(selectedPeriod);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        id,
        company_name,
        sessions_allocated,
        sessions_used
      `)
      .eq('is_active', true);

    if (error) throw error;

    // Get additional stats for each company
    const statsPromises = companies.map(async (company) => {
      // Get employee count for this company
      const { count: employeesCount } = await supabase
        .from('company_employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_active', true);

      // Get active users (users with activity in the period)
      const { count: activeUsers } = await supabase
        .from('bookings')
        .select('user_id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .gte('created_at', startDate.toISOString());

      // Get average satisfaction
      const { data: bookings } = await supabase
        .from('bookings')
        .select('rating')
        .eq('company_id', company.id)
        .not('rating', 'is', null)
        .gte('created_at', startDate.toISOString());

      const satisfactionAvg = bookings?.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.length
        : 0;

      const utilizationRate = company.sessions_allocated > 0 
        ? (company.sessions_used / company.sessions_allocated) * 100
        : 0;

      return {
        id: company.id,
        name: company.company_name,
        sessions_allocated: company.sessions_allocated || 0,
        sessions_used: company.sessions_used || 0,
        employees_count: employeesCount || 0,
        active_users: activeUsers || 0,
        satisfaction_avg: satisfactionAvg,
        utilization_rate: utilizationRate
      };
    });

    const stats = await Promise.all(statsPromises);
    setCompanyStats(stats);
  };

  const loadPillarStats = async () => {
    const days = parseInt(selectedPeriod);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pillars: Pillar[] = ['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'];
    
    const statsPromises = pillars.map(async (pillar) => {
      // Get sessions count
      const { count: sessionsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('pillar', pillar)
        .gte('created_at', startDate.toISOString());

      // Get satisfaction average
      const { data: bookings } = await supabase
        .from('bookings')
        .select('rating')
        .eq('pillar', pillar)
        .not('rating', 'is', null)
        .gte('created_at', startDate.toISOString());

      const satisfactionAvg = bookings?.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.length
        : 0;

      // Get completion rate
      const { count: completedSessions } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('pillar', pillar)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      const completionRate = sessionsCount > 0 ? (completedSessions / sessionsCount) * 100 : 0;

      // Get unique users count
      const { count: usersCount } = await supabase
        .from('user_progress')
        .select('user_id', { count: 'exact', head: true })
        .eq('pillar', pillar)
        .gte('action_date', startDate.toISOString());

      return {
        pillar,
        sessions_count: sessionsCount || 0,
        satisfaction_avg: satisfactionAvg,
        completion_rate: completionRate,
        users_count: usersCount || 0
      };
    });

    const stats = await Promise.all(statsPromises);
    setPillarStats(stats);
  };

  const loadMonthlyStats = async () => {
    const months = 12;
    const stats: MonthlyStats[] = [];

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Get sessions used
      const { count: sessionsUsed } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Get new users
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Get satisfaction average
      const { data: bookings } = await supabase
        .from('bookings')
        .select('rating')
        .not('rating', 'is', null)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      const satisfactionAvg = bookings?.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.length
        : 0;

      // Calculate revenue (simplified - based on sessions)
      const revenue = (sessionsUsed || 0) * 3500; // Assuming 3500 MZN per session

      stats.push({
        month: monthStart.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
        sessions_used: sessionsUsed || 0,
        new_users: newUsers || 0,
        satisfaction_avg: satisfactionAvg,
        revenue
      });
    }

    setMonthlyStats(stats.reverse());
  };

  const loadGoalStats = async () => {
    // Table 'user_goals' does not exist yet
    // This feature needs to be implemented with proper table creation
    console.warn('user_goals table not implemented yet');
    setGoalStats([]);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // This would integrate with a PDF generation library like react-pdf
      // For now, we'll create a CSV export
      const csvData = [
        'Relatório Administrativo',
        `Período: Últimos ${selectedPeriod} dias`,
        '',
        'Empresas',
        'Nome,Sessões Alocadas,Sessões Usadas,Funcionários,Utilização,Satisfação',
        ...companyStats.map(c => 
          `${c.name},${c.sessions_allocated},${c.sessions_used},${c.employees_count},${c.utilization_rate.toFixed(1)}%,${c.satisfaction_avg.toFixed(1)}`
        ),
        '',
        'Pilares',
        'Pilar,Sessões,Satisfação,Conclusão,Utilizadores',
        ...pillarStats.map(p => 
          `${PILLAR_DISPLAY_NAMES[p.pillar]},${p.sessions_count},${p.satisfaction_avg.toFixed(1)},${p.completion_rate.toFixed(1)}%,${p.users_count}`
        )
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_admin_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "Ficheiro CSV gerado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar relatório",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Relatórios Administrativos</h2>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Relatórios Administrativos</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresas Ativas</p>
                <p className="text-2xl font-bold">{companyStats.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessões</p>
                <p className="text-2xl font-bold">
                  {companyStats.reduce((sum, c) => sum + c.sessions_used, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilizadores Ativos</p>
                <p className="text-2xl font-bold">
                  {companyStats.reduce((sum, c) => sum + c.active_users, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold">
                  {companyStats.length > 0 
                    ? (companyStats.reduce((sum, c) => sum + c.satisfaction_avg, 0) / companyStats.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="pillars">Pilares</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="grid gap-4">
            {companyStats.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {company.name}
                    <Badge variant="outline">
                      {company.utilization_rate.toFixed(1)}% utilização
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sessões Alocadas</p>
                      <p className="text-lg font-semibold">{company.sessions_allocated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sessões Usadas</p>
                      <p className="text-lg font-semibold">{company.sessions_used}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Funcionários</p>
                      <p className="text-lg font-semibold">{company.employees_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfação</p>
                      <p className="text-lg font-semibold">{company.satisfaction_avg.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilização</span>
                      <span>{company.utilization_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={company.utilization_rate} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pillars Tab */}
        <TabsContent value="pillars" className="space-y-4">
          <div className="grid gap-4">
            {pillarStats.map((pillar) => (
              <Card key={pillar.pillar}>
                <CardHeader>
                  <CardTitle>{PILLAR_DISPLAY_NAMES[pillar.pillar]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sessões</p>
                      <p className="text-lg font-semibold">{pillar.sessions_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfação</p>
                      <p className="text-lg font-semibold">{pillar.satisfaction_avg.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conclusão</p>
                      <p className="text-lg font-semibold">{pillar.completion_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Utilizadores</p>
                      <p className="text-lg font-semibold">{pillar.users_count}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conclusão</span>
                      <span>{pillar.completion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={pillar.completion_rate} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4">
            {monthlyStats.map((month, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{month.month}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sessões</p>
                      <p className="text-lg font-semibold">{month.sessions_used}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Novos Utilizadores</p>
                      <p className="text-lg font-semibold">{month.new_users}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfação</p>
                      <p className="text-lg font-semibold">{month.satisfaction_avg.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Receita</p>
                      <p className="text-lg font-semibold">{month.revenue} MZN</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4">
            {goalStats.map((goal) => (
              <Card key={goal.pillar}>
                <CardHeader>
                  <CardTitle>{PILLAR_DISPLAY_NAMES[goal.pillar]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Objetivos Definidos</p>
                      <p className="text-lg font-semibold">{goal.goals_set}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Objetivos Alcançados</p>
                      <p className="text-lg font-semibold">{goal.goals_achieved}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                      <p className="text-lg font-semibold">{goal.achievement_rate.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Alcanço</span>
                      <span>{goal.achievement_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={goal.achievement_rate} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
