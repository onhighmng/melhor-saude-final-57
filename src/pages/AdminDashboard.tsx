import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Bell, 
  ChevronDown,
  ChevronUp,
  Download,
  Filter
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import PlatformAnalyticsOverview from '@/components/admin/PlatformAnalyticsOverview';
import ChangeRequestsQueue from '@/components/admin/ChangeRequestsQueue';
import SquareTile from '@/components/admin/SquareTile';
import FullscreenModal from '@/components/admin/FullscreenModal';

type Panel = 'sessions' | 'companies' | 'providers' | 'changeRequests' | null;

const AdminDashboard = () => {
  const [chartPeriod, setChartPeriod] = useState('7days');
  const [chartCollapsed, setChartCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  
  const { data: analyticsData, isLoading } = useAnalytics();

  const openPanel = (panel: Panel) => {
    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  // Mock data for dashboard metrics
  const metrics = {
    activeCompanies: 24,
    activeUsers: 1247,
    registeredProviders: 89,
    sessionsThisMonth: 543,
    absenceRate: 8.5,
    topPillar: 'Saúde Mental',
    functionErrors: 3
  };

  // Mock data for recent sessions chart
  const sessionsData = [
    { date: '2/01', sessions: 45, lastMonth: 38 },
    { date: '3/01', sessions: 52, lastMonth: 42 },
    { date: '4/01', sessions: 48, lastMonth: 39 },
    { date: '5/01', sessions: 61, lastMonth: 45 },
    { date: '6/01', sessions: 55, lastMonth: 48 },
    { date: '7/01', sessions: 67, lastMonth: 52 },
    { date: '8/01', sessions: 59, lastMonth: 49 }
  ];

  // Mock data for change requests
  const changeRequests = [
    { id: 1, user: 'Ana Silva', pillar: 'Saúde Mental', currentProvider: 'Dr. João Mendes', requestedProvider: 'Dra. Maria Santos', status: 'pending' },
    { id: 2, user: 'Pedro Costa', pillar: 'Assistência Jurídica', currentProvider: 'Dr. Carlos Lima', requestedProvider: 'Dra. Sofia Alves', status: 'pending' },
    { id: 3, user: 'Rita Fernandes', pillar: 'Bem-estar Físico', currentProvider: 'Prof. Miguel Torres', requestedProvider: 'Prof. Ana Rodrigues', status: 'pending' }
  ];

  // Mock data for recent sessions
  const recentSessions = [
    { user: 'João Santos', pillar: 'Saúde Mental', provider: 'Dra. Maria Santos', status: 'completed' },
    { user: 'Ana Oliveira', pillar: 'Assistência Financeira', provider: 'Dr. Paulo Reis', status: 'scheduled' },
    { user: 'Carlos Silva', pillar: 'Assistência Jurídica', provider: 'Dra. Sofia Alves', status: 'no-show' },
    { user: 'Rita Costa', pillar: 'Bem-estar Físico', provider: 'Prof. Ana Rodrigues', status: 'completed' }
  ];

  // Mock data for recent companies
  const recentCompanies = [
    { name: 'TechCorp Lda', employees: 45, quota: 180 },
    { name: 'HealthPlus SA', employees: 78, quota: 312 },
    { name: 'InnovateLab', employees: 23, quota: 92 }
  ];

  // Mock data for new providers
  const newProviders = [
    { name: 'Dr. Fernando Alves', pillar: 'Saúde Mental', licenseStatus: 'verified' },
    { name: 'Prof. Carla Mendes', pillar: 'Bem-estar Físico', licenseStatus: 'pending' },
    { name: 'Dra. Isabel Santos', pillar: 'Assistência Jurídica', licenseStatus: 'verified' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-green/10 text-emerald-green border-emerald-green/20">Concluída</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="bg-bright-royal/10 text-bright-royal border-bright-royal/20">Agendada</Badge>;
      case 'no-show':
        return <Badge variant="destructive" className="bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20">Falta</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warm-orange/10 text-warm-orange border-warm-orange/20">Pendente</Badge>;
      case 'verified':
        return <Badge variant="default" className="bg-emerald-green/10 text-emerald-green border-emerald-green/20">Verificado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-foreground mb-2">Dashboard</h1>
            <p className="text-small text-muted-foreground">Visão global da plataforma</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
            </Button>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-button">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Top row - Platform Analytics Overview and Change Requests tile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Platform Analytics Overview - takes 3/4 of the space */}
          <div className="lg:col-span-3">
            <PlatformAnalyticsOverview metrics={metrics} />
          </div>

          {/* Change Requests Tile - takes 1/4 of the space */}
          <div className="lg:col-span-1">
            <Card 
              className="rounded-xl shadow-custom-lg border-border/40 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-300 cursor-pointer hover-lift"
              onClick={() => openPanel('changeRequests')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-h3 text-foreground mb-1">Pedidos de Troca</CardTitle>
                <p className="text-small text-muted-foreground">3 pedidos pendentes</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {changeRequests.slice(0, 2).map((request, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-small font-medium truncate">{request.user}</p>
                        <p className="text-xs text-muted-foreground truncate">{request.pillar}</p>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                  {changeRequests.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      +{changeRequests.length - 2} mais...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sessions Chart - Collapsible */}
        <div className={`transition-all duration-300 ${chartCollapsed ? 'h-16' : ''}`}>
          <Card className="rounded-xl shadow-custom-lg border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader 
              className="flex flex-row items-center justify-between p-6 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setChartCollapsed(!chartCollapsed)}
            >
                <div>
                  <CardTitle className="text-h3 text-foreground mb-1">Evolução de Sessões</CardTitle>
                  <p className="text-small text-muted-foreground">MTD vs. último mês</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={chartPeriod} onValueChange={setChartPeriod}>
                    <SelectTrigger className="w-32 text-small">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 dias</SelectItem>
                      <SelectItem value="30days">30 dias</SelectItem>
                      <SelectItem value="90days">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  {chartCollapsed ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            {!chartCollapsed && (
              <CardContent className="p-6 pt-0">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={sessionsData}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLastMonth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" className="text-small" />
                    <YAxis stroke="hsl(var(--muted-foreground))" className="text-small" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontFamily: 'Baskervville',
                        fontSize: '14px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorSessions)"
                      name="Este mês"
                    />
                    <Area
                      type="monotone"
                      dataKey="lastMonth"
                      stroke="hsl(var(--muted-foreground))"
                      fillOpacity={1}
                      fill="url(#colorLastMonth)"
                      name="Mês anterior"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Square Tiles Grid */}
        <div className="grid grid-cols-3 gap-6">
          <Card 
            className="rounded-xl shadow-custom-lg border-border/40 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-300 cursor-pointer hover-lift"
            onClick={() => openPanel('sessions')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 text-foreground mb-1">Últimas Sessões</CardTitle>
              <p className="text-small text-muted-foreground">4 sessões recentes</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentSessions.slice(0, 2).map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-medium truncate">{session.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.pillar}</p>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                ))}
                {recentSessions.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    +{recentSessions.length - 2} mais...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="rounded-xl shadow-custom-lg border-border/40 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-300 cursor-pointer hover-lift"
            onClick={() => openPanel('companies')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 text-foreground mb-1">Empresas Recentes</CardTitle>
              <p className="text-small text-muted-foreground">3 empresas registadas</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentCompanies.map((company, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-medium truncate">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.employees} colaboradores</p>
                    </div>
                    <div className="ml-2">
                      <Badge variant="secondary" className="text-xs">
                        {company.quota}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="rounded-xl shadow-custom-lg border-border/40 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-300 cursor-pointer hover-lift"
            onClick={() => openPanel('providers')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 text-foreground mb-1">Prestadores Novos</CardTitle>
              <p className="text-small text-muted-foreground">3 prestadores pendentes</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {newProviders.map((provider, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-medium truncate">{provider.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{provider.pillar}</p>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(provider.licenseStatus)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fullscreen Modals */}
        <FullscreenModal
          isOpen={activePanel === 'sessions'}
          onClose={closePanel}
          title="Últimas Sessões"
          description="Sessões recentes com status atualizado"
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="font-maname">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" className="font-maname">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {recentSessions.map((session, i) => (
              <Card key={i} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-baskervville text-xl font-semibold text-foreground mb-2">
                      {session.user}
                    </p>
                    <p className="font-maname text-base text-muted-foreground mb-1">
                      {session.pillar}
                    </p>
                    <p className="font-maname text-sm text-muted-foreground">
                      {session.provider}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(session.status)}
                    <Button variant="outline" size="sm" className="font-maname">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </FullscreenModal>

        <FullscreenModal
          isOpen={activePanel === 'companies'}
          onClose={closePanel}
          title="Empresas Recentes"
          description="Empresas registadas com quotas ativas"
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="font-maname">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" className="font-maname">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {recentCompanies.map((company, i) => (
              <Card key={i} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-baskervville text-xl font-semibold text-foreground mb-2">
                      {company.name}
                    </p>
                    <p className="font-maname text-base text-muted-foreground mb-1">
                      {company.employees} colaboradores
                    </p>
                    <p className="font-maname text-sm text-muted-foreground">
                      Domínio: {company.name.toLowerCase().replace(/\s+/g, '')}.com
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-maname text-sm">
                      {company.quota} sessões
                    </Badge>
                    <div className="text-right">
                      <p className="font-maname text-sm text-muted-foreground">85% uso</p>
                      <Badge variant="default" className="font-maname text-xs">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </FullscreenModal>

        <FullscreenModal
          isOpen={activePanel === 'changeRequests'}
          onClose={closePanel}
          title="Pedidos de Troca"
          description="Solicitações de mudança de prestador pendentes"
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="font-maname">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" className="font-maname">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {changeRequests.map((request, i) => (
              <Card key={i} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-baskervville text-xl font-semibold text-foreground mb-2">
                      {request.user}
                    </p>
                    <p className="font-maname text-base text-muted-foreground mb-1">
                      {request.pillar}
                    </p>
                    <p className="font-maname text-sm text-muted-foreground">
                      De: {request.currentProvider} → Para: {request.requestedProvider}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(request.status)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="font-maname text-green-600 border-green-600 hover:bg-green-50">
                        Aprovar
                      </Button>
                      <Button variant="outline" size="sm" className="font-maname text-red-600 border-red-600 hover:bg-red-50">
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </FullscreenModal>

        <FullscreenModal
          isOpen={activePanel === 'providers'}
          onClose={closePanel}
          title="Prestadores Novos"
          description="Prestadores aguardam verificação"
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="font-maname">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" className="font-maname">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {newProviders.map((provider, i) => (
              <Card key={i} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-baskervville text-xl font-semibold text-foreground mb-2">
                      {provider.name}
                    </p>
                    <p className="font-maname text-base text-muted-foreground mb-1">
                      {provider.pillar}
                    </p>
                    <p className="font-maname text-sm text-muted-foreground">
                      Licença: {provider.licenseStatus === 'verified' ? 'Verificada' : 'Pendente'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(provider.licenseStatus)}
                    <Button variant="outline" size="sm" className="font-maname">
                      Ver perfil
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </FullscreenModal>
      </div>
    </div>
  );
};

export default AdminDashboard;