import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const quickActions = [
    {
      title: 'Marcar Sessão',
      description: 'Agende uma nova consulta com um especialista',
      icon: Calendar,
      action: () => navigate('/user/book'),
      color: 'bg-blue-500',
    },
    {
      title: 'Minhas Sessões',
      description: 'Veja suas sessões agendadas e histórico',
      icon: Clock,
      action: () => navigate('/user/sessions'),
      color: 'bg-emerald-500',
    },
    {
      title: 'Meu Progresso',
      description: 'Acompanhe sua jornada de bem-estar',
      icon: TrendingUp,
      action: () => navigate('/user/sessions'),
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {profile?.name || 'Utilizador'}
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de saúde e bem-estar
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões este Mês
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nenhuma sessão agendada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Sessão
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Nenhuma sessão agendada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Sessões
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sessões completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group">
                    Acessar
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Começar Agora</CardTitle>
          <CardDescription>
            Dê o primeiro passo na sua jornada de bem-estar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nossa plataforma oferece acesso a profissionais qualificados nas áreas de saúde mental, 
            bem-estar físico e financeiro. Agende sua primeira sessão hoje mesmo.
          </p>
          <Button onClick={() => navigate('/user/book')} className="w-full sm:w-auto">
            Marcar Primeira Sessão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
