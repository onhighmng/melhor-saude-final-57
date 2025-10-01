import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Brain, Heart, Wallet, ArrowRight, Plus, Phone, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const upcomingSessions = [
    {
      id: 1,
      specialist: 'Dr. Ana Silva',
      speciality: 'Psicologia',
      date: 'Qui, 20 Jun 2024',
      time: '14:30',
      type: 'Video Consulta',
      pillar: 'mental',
      avatar: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png'
    },
    {
      id: 2,
      specialist: 'Dr. Carlos Santos',
      speciality: 'Nutrição',
      date: 'Sex, 21 Jun 2024',
      time: '10:00',
      type: 'Consulta Presencial',
      pillar: 'physical',
      avatar: '/lovable-uploads/706fc722-1075-467c-bac9-f33982fdd983.png'
    }
  ];

  const wellnessMetrics = [
    {
      label: 'Bem-estar Mental',
      value: '85',
      unit: '%',
      icon: Brain,
      color: 'bg-purple-100 text-purple-600',
      trend: '+5%'
    },
    {
      label: 'Saúde Física',
      value: '92',
      unit: '%',
      icon: Heart,
      color: 'bg-green-100 text-green-600',
      trend: '+3%'
    },
    {
      label: 'Saúde Financeira',
      value: '78',
      unit: '%',
      icon: Wallet,
      color: 'bg-blue-100 text-blue-600',
      trend: '+8%'
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">
          Olá, {profile?.name || 'Utilizador'} 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Últimas atualizações dos últimos 7 dias
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Next Session */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24/05/2024</p>
                <CardTitle className="text-2xl mt-2">Próxima Sessão</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/10">
                <AvatarImage src="/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">Dr. Ana Silva</h3>
                <p className="text-sm text-muted-foreground">24/05/2024</p>
                <Badge className="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-200">
                  <Brain className="h-3 w-3 mr-1" />
                  Psicologia
                </Badge>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate('/user/sessions')}>
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>

        {/* Center Column - Hero Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2">Novo</Badge>
                <CardTitle className="text-xl">Avaliação de Bem-estar</CardTitle>
                <CardDescription>Descubra suas necessidades</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Faça uma avaliação completa
                </p>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/user/book')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Começar Avaliação
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Schedule */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agenda</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Próximas Consultas</p>
              {upcomingSessions.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors mb-2"
                  onClick={() => navigate('/user/sessions')}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.avatar} />
                    <AvatarFallback>{session.specialist.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{session.speciality}</p>
                    <p className="text-xs text-muted-foreground">{session.time}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {session.type.includes('Video') ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/user/book')}>
              <Calendar className="mr-2 h-4 w-4" />
              Marcar Nova Sessão
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid - Metrics & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wellness Metrics */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Métricas de Bem-estar</CardTitle>
              <Badge variant="outline">Últimos 7 dias</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wellnessMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">{metric.trend} vs semana passada</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/user/sessions')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Histórico de Sessões
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/user/settings')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/support')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
