import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Demo users for testing
const demoUsers = [
  { 
    email: 'ana.silva@prestador.com', 
    title: 'Affiliate', 
    icon: UserCheck, 
    role: 'prestador' as const, 
    color: 'bg-green-500',
    name: 'Dra. Ana Silva',
    password: 'demo123'
  },
  { 
    email: 'rh@empresademo.com', 
    title: 'RH', 
    icon: Building2, 
    role: 'hr' as const, 
    color: 'bg-purple-500',
    name: 'Maria Silva',
    password: 'demo123'
  },
  { 
    email: 'admin@onhigh.com', 
    title: 'Admin', 
    icon: Shield, 
    role: 'admin' as const, 
    color: 'bg-red-500',
    name: 'Admin OnHigh',
    password: 'demo123'
  },
  { 
    email: 'specialist@onhigh.com', 
    title: 'Profissional de Permanencia', 
    icon: Users, 
    role: 'especialista_geral' as const, 
    color: 'bg-orange-500',
    name: 'Especialista Geral',
    password: 'demo123'
  }
];

const mockUser = demoUsers[0];
const mockAdminUser = demoUsers[2];
const mockHRUser = demoUsers[1];
const mockPrestadorUser = demoUsers[0];
const mockEspecialistaGeralUser = demoUsers[3];
import { 
  User, 
  Shield, 
  Building2, 
  UserCheck,
  ArrowRight,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Play,
  Eye,
  CalendarCheck,
  BookOpen,
  UserCog
} from 'lucide-react';

const Demo = () => {
  const { profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const demoUsers = [
    {
      ...mockUser,
      title: 'Utilizador',
      description: 'Aceda aos recursos de bem-estar e agende sessões',
      icon: User,
      role: 'user' as const,
      dashboardPath: '/user/dashboard',
      quickLinks: [
        { label: 'Dashboard', path: '/user/dashboard', icon: BarChart3 },
        { label: 'Agendar Sessão', path: '/user/book', icon: Calendar },
        { label: 'Sessões', path: '/user/sessions', icon: CalendarCheck },
        { label: 'Recursos', path: '/user/resources', icon: BookOpen },
        { label: 'Definições', path: '/user/settings', icon: Settings }
      ],
      features: ['Agendamento', 'Recursos', 'Acompanhamento', 'Feedback'],
      color: 'bg-blue-500'
    },
    {
      ...mockPrestadorUser,
      title: 'Prestador de Serviços',
      description: 'Gerir as suas sessões e disponibilidade',
      icon: UserCheck,
      role: 'prestador' as const,
      dashboardPath: '/prestador/dashboard',
      quickLinks: [
        { label: 'Dashboard', path: '/prestador/dashboard', icon: BarChart3 },
        { label: 'Sessões', path: '/prestador/sessoes', icon: Calendar },
        { label: 'Disponibilidade', path: '/prestador/availability', icon: Settings },
        { label: 'Perfil', path: '/prestador/profile', icon: User }
      ],
      features: ['Gestão de Sessões', 'Disponibilidade', 'Perfil', 'Vídeos'],
      color: 'bg-green-500'
    },
  {
    ...mockHRUser,
    title: 'Recursos Humanos',
    description: 'Gerir colaboradores e acompanhar métricas da empresa',
    icon: Building2,
    role: 'hr' as const,
    company: 'Empresa Demo',
    dashboardPath: '/company/dashboard',
    quickLinks: [
      { label: 'Dashboard', path: '/company/dashboard', icon: BarChart3 },
      { label: 'Colaboradores', path: '/company/employees', icon: Users },
      { label: 'Convites', path: '/company/invites', icon: ArrowRight },
      { label: 'Relatórios', path: '/company/reports', icon: BarChart3 },
      { label: 'Configurações', path: '/company/settings', icon: Settings }
    ],
    features: ['Gestão de Colaboradores', 'Relatórios', 'Convites', 'Configurações'],
    color: 'bg-purple-500'
  },
    {
      ...mockAdminUser,
      title: 'Administrador',
      description: 'Controlo total da plataforma e gestão de utilizadores',
      icon: Shield,
      role: 'admin' as const,
      dashboardPath: '/admin/dashboard',
      quickLinks: [
        { label: 'Utilizadores', path: '/admin/users', icon: Users },
        { label: 'Prestadores', path: '/admin/providers', icon: UserCheck },
        { label: 'Sessões', path: '/admin/sessions', icon: Calendar },
        { label: 'Suporte', path: '/admin/support', icon: Settings },
        { label: 'Configurações', path: '/admin/settings', icon: Settings }
      ],
      features: ['Gestão Completa', 'Analytics', 'Suporte', 'Configurações'],
      color: 'bg-red-500'
    },
    {
      ...mockEspecialistaGeralUser,
      title: 'Especialista Geral',
      description: 'Atendimento de chamadas, gestão de sessões e historial',
      icon: UserCog,
      role: 'especialista_geral' as const,
      dashboardPath: '/especialista/dashboard',
      quickLinks: [
        { label: 'Dashboard', path: '/especialista/dashboard', icon: BarChart3 },
        { label: 'Pedidos de Chamada', path: '/especialista/call-requests', icon: Calendar },
        { label: 'Sessões Agendadas', path: '/especialista/sessions', icon: CalendarCheck },
        { label: 'Historial', path: '/especialista/user-history', icon: Users }
      ],
      features: ['Chamadas', 'Sessões', 'Historial'],
      color: 'bg-orange-500'
    }
  ];

  const handleRoleSwitch = async (demoUser: typeof demoUsers[0]) => {
    setIsTransitioning(true);
    
    try {
      // Simulate login with the demo user's email
      const result = await login(demoUser.email, 'demo-password');
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(demoUser.dashboardPath);
    } catch (error) {
      console.error('Role switch failed:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleLogout = async () => {
    setIsTransitioning(true);
    try {
      await logout();
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleQuickNavigation = (path: string) => {
    navigate(path);
  };

  const getCurrentUserCard = () => {
    if (!profile) return null;
    
    const currentUser = demoUsers.find(user => user.role === profile.role);
    if (!currentUser) return null;

    return (
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <currentUser.icon className="h-5 w-5" />
            Sessão Ativa: {currentUser.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Está atualmente ligado como <strong>{profile.name}</strong>
            </p>
            <Badge variant="secondary">{profile.role}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Loading overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm font-medium">A mudar de utilizador...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Demo Interativo
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore a plataforma com diferentes perfis de utilizador
          </p>
        </div>

        {/* Current Session Control */}
        {profile && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Sessão Ativa: {demoUsers.find(u => u.role === profile.role)?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Conectado como <strong>{profile.name}</strong> ({profile.email})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Início
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                    disabled={isTransitioning}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Mudar Utilizador</TabsTrigger>
            <TabsTrigger value="navigation">Navegação Rápida</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            {/* Demo Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoUsers.map((demoUser) => {
                const IconComponent = demoUser.icon;
                const isCurrentUser = profile?.role === demoUser.role;
                
                return (
                  <Card 
                    key={demoUser.role}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      isCurrentUser ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-xl'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-full ${demoUser.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        {isCurrentUser && (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{demoUser.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {demoUser.description}
                      </p>
                      
                       <div className="space-y-2">
                        <div className="text-xs space-y-1 bg-muted/50 p-2 rounded">
                          <p><strong>Nome:</strong> {demoUser.name}</p>
                          <p><strong>Email:</strong> {demoUser.email}</p>
                          {'company' in demoUser && demoUser.company && (
                            <p><strong>Empresa:</strong> {demoUser.company}</p>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleRoleSwitch(demoUser)}
                          className="w-full"
                          variant={isCurrentUser ? "secondary" : "default"}
                          disabled={isCurrentUser || isTransitioning}
                        >
                          {isCurrentUser ? 'Utilizador Atual' : `Entrar como ${demoUser.title}`}
                        </Button>

                        {/* Quick navigation for current user */}
                        {isCurrentUser && demoUser.quickLinks && (
                          <div className="space-y-2 pt-2 border-t">
                            <h5 className="text-xs font-medium text-muted-foreground">Navegação Rápida</h5>
                            <div className="grid grid-cols-2 gap-1">
                              {demoUser.quickLinks.map((link, index) => {
                                const LinkIcon = link.icon;
                                return (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuickNavigation(link.path)}
                                    className="justify-start h-8 text-xs"
                                  >
                                    <LinkIcon className="h-3 w-3 mr-1" />
                                    {link.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="navigation" className="space-y-6">
            {/* General Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Páginas Principais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 h-12"
                  >
                    <Home className="h-4 w-4" />
                    Página Inicial
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/help')}
                    className="flex items-center gap-2 h-12"
                  >
                    <Users className="h-4 w-4" />
                    Centro de Ajuda
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/support')}
                    className="flex items-center gap-2 h-12"
                  >
                    <Settings className="h-4 w-4" />
                    Suporte
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/terms')}
                    className="flex items-center gap-2 h-12"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Termos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific navigation */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Páginas de {demoUsers.find(u => u.role === profile.role)?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {demoUsers.find(u => u.role === profile.role)?.quickLinks?.map((link, index) => {
                      const LinkIcon = link.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleQuickNavigation(link.path)}
                          className="flex items-center gap-2 h-12 justify-start"
                        >
                          <LinkIcon className="h-4 w-4" />
                          {link.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4 border-t">
          <p>Modo Demo - Explore todas as funcionalidades da plataforma</p>
        </div>
      </div>
    </div>
  );
};

export default Demo;