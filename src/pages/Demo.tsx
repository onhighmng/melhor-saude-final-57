import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockUser, mockAdminUser, mockHRUser, mockPrestadorUser } from '@/data/mockData';
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
  Eye
} from 'lucide-react';

const Demo = () => {
  const { t } = useTranslation('common');
  const { t: tNav } = useTranslation('navigation');
  const { profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const demoUsers = [
    {
      ...mockUser,
      title: t('demo.roles.regularUser'),
      description: t('demo.roles.regularUserDesc'),
      icon: User,
      role: 'user' as const,
      dashboardPath: '/user/sessions',
      quickLinks: [
        { label: tNav('user.sessions'), path: '/user/sessions', icon: Calendar },
        { label: tNav('company.settings'), path: '/user/settings', icon: Settings },
        { label: t('demo.helpCenter'), path: '/help', icon: Users }
      ],
      features: ['Marcar Sessões', 'Ver Histórico', 'Dashboard Pessoal', 'Ajuda'],
      color: 'bg-blue-500'
    },
    {
      ...mockPrestadorUser,
      title: t('demo.roles.serviceProvider'),
      description: t('demo.roles.serviceProviderDesc'),
      icon: UserCheck,
      role: 'prestador' as const,
      dashboardPath: '/prestador/dashboard',
      quickLinks: [
        { label: tNav('provider.dashboard'), path: '/prestador/dashboard', icon: BarChart3 },
        { label: tNav('provider.sessions'), path: '/prestador/sessoes', icon: Calendar },
        { label: tNav('provider.availability'), path: '/prestador/availability', icon: Settings },
        { label: tNav('provider.profile'), path: '/prestador/profile', icon: User }
      ],
      features: ['Gestão de Sessões', 'Disponibilidade', 'Perfil', 'Vídeos'],
      color: 'bg-green-500'
    },
    {
      ...mockHRUser,
      title: t('demo.roles.humanResources'),
      description: t('demo.roles.humanResourcesDesc'),
      icon: Building2,
      role: 'hr' as const,
      dashboardPath: '/company/dashboard',
      quickLinks: [
        { label: tNav('company.dashboard'), path: '/company/dashboard', icon: BarChart3 },
        { label: tNav('company.employees'), path: '/company/employees', icon: Users },
        { label: tNav('company.inviteCodes'), path: '/company/invites', icon: ArrowRight },
        { label: tNav('company.reports'), path: '/company/reports', icon: BarChart3 },
        { label: tNav('company.settings'), path: '/company/settings', icon: Settings }
      ],
      features: ['Gestão de Colaboradores', 'Relatórios', 'Convites', 'Configurações'],
      color: 'bg-purple-500'
    },
    {
      ...mockAdminUser,
      title: t('demo.roles.administrator'),
      description: t('demo.roles.administratorDesc'),
      icon: Shield,
      role: 'admin' as const,
      dashboardPath: '/admin/users',
      quickLinks: [
        { label: tNav('admin.users'), path: '/admin/users', icon: Users },
        { label: tNav('admin.providers'), path: '/admin/providers', icon: UserCheck },
        { label: tNav('admin.sessions'), path: '/admin/sessions', icon: Calendar },
        { label: t('demo.support'), path: '/admin/support', icon: Settings },
        { label: tNav('admin.settings'), path: '/admin/settings', icon: Settings }
      ],
      features: ['Gestão Completa', 'Analytics', 'Suporte', 'Configurações'],
      color: 'bg-red-500'
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
            <span className="text-sm font-medium">{t('demo.switchingUser')}</span>
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
              {t('demo.title')}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('demo.subtitle')}
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
                      {t('demo.activeSession')}: {demoUsers.find(u => u.role === profile.role)?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('demo.connectedAs')} <strong>{profile.name}</strong> ({profile.email})
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
                    {t('demo.home')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                    disabled={isTransitioning}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('demo.logout')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">{t('demo.switchUsers')}</TabsTrigger>
            <TabsTrigger value="navigation">{t('demo.quickNavigation')}</TabsTrigger>
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
                            {t('status.active')}
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
                          {demoUser.company && (
                            <p><strong>Empresa:</strong> {demoUser.company}</p>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleRoleSwitch(demoUser)}
                          className="w-full"
                          variant={isCurrentUser ? "secondary" : "default"}
                          disabled={isCurrentUser || isTransitioning}
                        >
                          {isCurrentUser ? t('demo.currentUser') : `${t('demo.enterAs')} ${demoUser.title}`}
                        </Button>

                        {/* Quick navigation for current user */}
                        {isCurrentUser && demoUser.quickLinks && (
                          <div className="space-y-2 pt-2 border-t">
                            <h5 className="text-xs font-medium text-muted-foreground">{t('demo.quickNavigationLabel')}</h5>
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
                <CardTitle>{t('demo.mainPages')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 h-12"
                  >
                    <Home className="h-4 w-4" />
                    {t('demo.homePage')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/help')}
                    className="flex items-center gap-2 h-12"
                  >
                    <Users className="h-4 w-4" />
                    {t('demo.helpCenter')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/support')}
                    className="flex items-center gap-2 h-12"
                  >
                    <Settings className="h-4 w-4" />
                    {t('demo.support')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/terms')}
                    className="flex items-center gap-2 h-12"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {t('demo.terms')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific navigation */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('demo.pagesOf')} {demoUsers.find(u => u.role === profile.role)?.title}</CardTitle>
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
          <p>{t('demo.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default Demo;