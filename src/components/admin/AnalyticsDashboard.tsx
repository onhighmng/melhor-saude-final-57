import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Calendar, CheckCircle, Brain, Scale, DollarSign, Heart } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';


const pillarColors = {
  Psicológico: 'hsl(var(--primary))',
  Jurídico: 'hsl(var(--secondary))',
  Financeiro: 'hsl(var(--accent))',
  Físico: 'hsl(var(--muted))'
};

const pillarIcons = {
  Psicológico: Brain,
  Jurídico: Scale,
  Financeiro: DollarSign,
  Físico: Heart
};

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const { data: analyticsData, isLoading, error } = useAnalytics();

  const getPillarData = () => {
    if (!analyticsData || !analyticsData['pillar_trends']) return [];
    switch (selectedPeriod) {
      case 'weekly': return analyticsData['pillar_trends'].weekly || [];
      case 'monthly': return analyticsData['pillar_trends'].monthly || [];
      case 'overall': return analyticsData['pillar_trends'].overall || [];
      default: return analyticsData['pillar_trends'].monthly || [];
    }
  };

  const formatPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'weekly': return 'Últimas 4 Semanas';
      case 'monthly': return 'Últimos 6 Meses';
      case 'overall': return 'Evolução Anual';
      default: return 'Últimos 6 Meses';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading analytics: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = {
    totalUsers: analyticsData?.total_users || 0,
    activeUsers: analyticsData?.active_users || 0,
    totalSessions: analyticsData?.total_bookings || 0,
    completionRate: analyticsData?.total_bookings > 0 ? 
      Math.round((analyticsData?.sessions_used || 0) / analyticsData.total_bookings * 100) : 0,
    averageSessionsPerUser: analyticsData?.total_users > 0 ? 
      Math.round((analyticsData?.sessions_used || 0) / analyticsData.total_users * 10) / 10 : 0,
    growthRate: 0,
    attendanceRate: analyticsData?.total_bookings > 0 ? 
      Math.round((analyticsData?.sessions_used || 0) / analyticsData.total_bookings * 100) : 0,
    noShowRate: analyticsData?.total_bookings > 0 ? 
      Math.round(((analyticsData?.total_bookings || 0) - (analyticsData?.sessions_used || 0)) / analyticsData.total_bookings * 100) : 0
  };



  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Utilizadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-blue">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics.growthRate}%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilizadores Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-blue">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-blue">{metrics.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.averageSessionsPerUser} média por utilizador
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-blue">{metrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="pillars" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pillars">Tendências dos Pilares</TabsTrigger>
          <TabsTrigger value="sessions">Atividade de Sessões</TabsTrigger>
        </TabsList>

        <TabsContent value="pillars" className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-navy-blue">Evolução dos Pilares</h3>
              <p className="text-sm text-muted-foreground">{formatPeriodLabel()}</p>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="overall">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-navy-blue">Tendência de Uso por Pilar</CardTitle>
                <CardDescription>Evolução do número de sessões por especialidade</CardDescription>
              </CardHeader>
              <CardContent>
                {getPillarData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getPillarData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="period"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      {Object.entries(pillarColors).map(([pillar, color]) => (
                        <Bar
                          key={pillar}
                          dataKey={pillar}
                          fill={color}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>Aguardando dados de tendências dos pilares...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pillar Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-blue">Distribuição dos Pilares</CardTitle>
                <CardDescription>Percentagem de uso por especialidade</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && analyticsData['pillar_distribution'] && analyticsData['pillar_distribution'].length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analyticsData['pillar_distribution']}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, value}) => `${value}%`}
                        >
                          {analyticsData['pillar_distribution'].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Percentagem']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="space-y-2 mt-4">
                      {analyticsData['pillar_distribution'].map((pillar) => {
                        const Icon = pillarIcons[pillar.name as keyof typeof pillarIcons];
                        return (
                          <div key={pillar.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: pillar.color }}
                              />
                              {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                              <span className="text-sm font-medium">{pillar.name}</span>
                            </div>
                            <Badge variant="secondary">{pillar.value}%</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>Aguardando dados de pilares...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy-blue">Atividade de Sessões</h3>
            <p className="text-sm text-muted-foreground">Comparação entre sessões agendadas, comparecidas e completadas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-navy-blue">Evolução da Atividade de Sessões</CardTitle>
                <CardDescription>Últimos 6 meses - comparação de agendamentos vs participação</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData?.['session_activity'] || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="period" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="agendadas" 
                      fill="hsl(var(--primary))" 
                      name="Agendadas"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="comparecidas" 
                      fill="hsl(var(--secondary))" 
                      name="Comparecidas"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="completadas" 
                      fill="hsl(var(--accent))" 
                      name="Completadas"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Session Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Comparência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy-blue">{metrics.attendanceRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground">--</span> vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy-blue">{metrics.completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground">--</span> vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">No-Show Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy-blue">{metrics.noShowRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground">--</span> vs mês anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;