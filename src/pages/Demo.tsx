import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Settings
} from 'lucide-react';

const Demo = () => {
  const { profile, login } = useAuth();
  const navigate = useNavigate();

  const demoUsers = [
    {
      ...mockUser,
      title: 'Utilizador Regular',
      description: 'Acesso a marcação de sessões, histórico e dashboard pessoal',
      icon: User,
      role: 'user' as const,
      dashboardPath: '/user/dashboard',
      features: ['Marcar Sessões', 'Ver Histórico', 'Dashboard Pessoal', 'Ajuda'],
      color: 'bg-blue-500'
    },
    {
      ...mockPrestadorUser,
      title: 'Prestador de Serviços',
      description: 'Gestão de perfil, sessões e disponibilidade',
      icon: UserCheck,
      role: 'prestador' as const,
      dashboardPath: '/prestador/dashboard',
      features: ['Gestão de Sessões', 'Disponibilidade', 'Perfil', 'Vídeos'],
      color: 'bg-green-500'
    },
    {
      ...mockHRUser,
      title: 'Recursos Humanos',
      description: 'Gestão de empresa, colaboradores e relatórios',
      icon: Building2,
      role: 'hr' as const,
      dashboardPath: '/company/dashboard',
      features: ['Gestão de Colaboradores', 'Relatórios', 'Convites', 'Configurações'],
      color: 'bg-purple-500'
    },
    {
      ...mockAdminUser,
      title: 'Administrador',
      description: 'Controlo total da plataforma e gestão de todos os utilizadores',
      icon: Shield,
      role: 'admin' as const,
      dashboardPath: '/admin/dashboard',
      features: ['Gestão Completa', 'Analytics', 'Suporte', 'Configurações'],
      color: 'bg-red-500'
    }
  ];

  const handleRoleSwitch = async (demoUser: typeof demoUsers[0]) => {
    // Simulate login with the demo user's email
    await login(demoUser.email, 'demo-password');
    navigate(demoUser.dashboardPath);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Demo da Plataforma
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore todas as funcionalidades da plataforma através dos diferentes tipos de utilizador.
            Clique em qualquer role para fazer login e aceder ao respetivo dashboard.
          </p>
        </div>

        {/* Current Session */}
        {getCurrentUserCard()}

        {/* Demo Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoUsers.map((demoUser) => {
            const IconComponent = demoUser.icon;
            const isCurrentUser = profile?.role === demoUser.role;
            
            return (
              <Card 
                key={demoUser.role}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isCurrentUser ? 'ring-2 ring-primary' : 'hover:shadow-xl'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-full ${demoUser.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
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
                    <h4 className="text-sm font-medium">Funcionalidades:</h4>
                    <ul className="text-xs space-y-1">
                      {demoUser.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="text-xs space-y-1">
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
                      disabled={isCurrentUser}
                    >
                      {isCurrentUser ? 'Já Conectado' : `Entrar como ${demoUser.title}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Navegação Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Página Inicial
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/user/book')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Marcar Sessão
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Admin Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/support')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Suporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Esta é uma interface de demonstração com dados mockados para fins de teste e apresentação.</p>
        </div>
      </div>
    </div>
  );
};

export default Demo;