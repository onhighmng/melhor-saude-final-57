import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  MessageCircle,
  Award,
  Star,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  Edit
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pillar, PILLAR_DISPLAY_NAMES } from '@/integrations/supabase/types-unified';

interface UpcomingSession {
  id: string;
  pillar: Pillar;
  date: string;
  start_time: string;
  prestador_name: string;
  session_type: string;
}

interface RecentActivity {
  id: string;
  type: 'session' | 'chat' | 'resource' | 'milestone';
  title: string;
  pillar: Pillar;
  date: string;
  description: string;
}

export const UserDashboard: React.FC = () => {
  const { t } = useTranslation('user');
  const { toast } = useToast();
  const { profile } = useAuth();
  const {
    loading,
    progress,
    goals,
    milestones,
    overallProgress,
    getPillarProgress,
    getAchievedMilestones,
    getPendingMilestones,
    getActiveGoals,
    getCompletedGoals,
    trackProgress
  } = useUserProgress();

  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      loadUpcomingSessions(),
      loadRecentActivity()
    ]);
  };

  const loadUpcomingSessions = async () => {
    if (!profile?.id) return;

    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          pillar,
          date,
          start_time,
          session_type,
          prestadores!bookings_prestador_id_fkey(
            profiles!prestadores_user_id_fkey(name)
          )
        `)
        .eq('user_id', profile.id)
        .in('status', ['confirmed', 'pending'])
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;

      const sessions: UpcomingSession[] = (data || []).map(booking => ({
      id: booking.id,
        pillar: booking.pillar as Pillar,
      date: booking.date,
        start_time: booking.start_time,
        prestador_name: booking.prestadores?.profiles?.name || 'Especialista',
        session_type: booking.session_type
      }));

      setUpcomingSessions(sessions);
    } catch (error) {
      console.error('Error loading upcoming sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadRecentActivity = async () => {
    if (!profile?.id) return;

    setIsLoadingActivity(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profile.id)
        .order('action_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      const activities: RecentActivity[] = (data || []).map(activity => {
        let title = '';
        let description = '';

        switch (activity.action_type) {
          case 'session_completed':
            title = 'Sessão Concluída';
            description = `Sessão de ${PILLAR_DISPLAY_NAMES[activity.pillar as Pillar]} concluída`;
            break;
          case 'chat_interaction':
            title = 'Chat com Especialista';
            description = `Interação no pilar ${PILLAR_DISPLAY_NAMES[activity.pillar as Pillar]}`;
            break;
          case 'resource_viewed':
            title = 'Recurso Visualizado';
            description = `Recurso do pilar ${PILLAR_DISPLAY_NAMES[activity.pillar as Pillar]}`;
            break;
          case 'milestone_achieved':
            title = 'Marco Alcançado';
            description = activity.metadata?.milestone || 'Marco alcançado';
            break;
        }

        return {
          id: activity.id,
          type: activity.action_type as any,
          title,
          pillar: activity.pillar as Pillar,
          date: activity.action_date,
          description
        };
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Calendar className="h-4 w-4" />;
      case 'chat':
        return <MessageCircle className="h-4 w-4" />;
      case 'resource':
        return <BookOpen className="h-4 w-4" />;
      case 'milestone':
        return <Award className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'text-blue-500';
      case 'chat':
        return 'text-green-500';
      case 'resource':
        return 'text-purple-500';
      case 'milestone':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
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
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {profile?.name || 'Utilizador'}!
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
        </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso Geral
          </CardTitle>
          <CardDescription>
            Seu progresso geral em todos os pilares de bem-estar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso Total</span>
              <span className="text-sm font-medium">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full h-3" />
            <div className="text-sm text-muted-foreground">
              Continue trabalhando nos seus objetivos para aumentar o progresso!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pillar Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'] as Pillar[]).map((pillar) => {
          const pillarProgress = getPillarProgress(pillar);
          const pillarGoals = goals.filter(g => g.pillar === pillar);
          const activeGoals = pillarGoals.filter(g => g.status === 'active').length;
          const completedGoals = pillarGoals.filter(g => g.status === 'completed').length;

          return (
            <Card key={pillar}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{PILLAR_DISPLAY_NAMES[pillar]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{pillarProgress?.progress_percentage.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={pillarProgress?.progress_percentage || 0} className="w-full" />
              </div>
              
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-medium">{pillarProgress?.sessions_completed || 0}</p>
                    <p className="text-muted-foreground">Sessões</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{activeGoals}</p>
                    <p className="text-muted-foreground">Objetivos</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <Target className="h-3 w-3 mr-1" />
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
              </div>
              
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="milestones">Marcos</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Sessões
                </CardTitle>
                <CardDescription>
                  Suas sessões agendadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">A carregar sessões...</p>
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{PILLAR_DISPLAY_NAMES[session.pillar]}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString('pt-PT')} às {session.start_time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.prestador_name} • {session.session_type}
                          </p>
                        </div>
                        <Badge variant="outline">Confirmada</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma sessão agendada</p>
                    <p className="text-sm">Agende sua primeira sessão para começar</p>
              </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Suas últimas atividades na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">A carregar atividade...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded">
                        <div className={`${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {PILLAR_DISPLAY_NAMES[activity.pillar]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade recente</p>
                    <p className="text-sm">Comece a usar a plataforma para ver sua atividade</p>
              </div>
                )}
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6">
            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos Ativos
                </CardTitle>
                <CardDescription>
                  Seus objetivos em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getActiveGoals().length > 0 ? (
                  <div className="space-y-4">
                    {getActiveGoals().map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{goal.goal_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {goal.pillar && PILLAR_DISPLAY_NAMES[goal.pillar]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prioridade: {goal.priority}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Ativo</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum objetivo ativo</p>
                    <p className="text-sm">Complete o onboarding para definir seus objetivos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Objetivos Concluídos
                </CardTitle>
                <CardDescription>
                  Objetivos que você alcançou
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getCompletedGoals().length > 0 ? (
                    <div className="space-y-4">
                    {getCompletedGoals().map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-4 border rounded bg-green-50">
                        <div className="flex-1">
                          <p className="font-medium">{goal.goal_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {goal.pillar && PILLAR_DISPLAY_NAMES[goal.pillar]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Concluído em {new Date(goal.updated_at).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluído
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum objetivo concluído ainda</p>
                    <p className="text-sm">Continue trabalhando nos seus objetivos!</p>
                  </div>
                )}
              </CardContent>
            </Card>
                    </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="grid gap-6">
            {/* Achieved Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Marcos Alcançados
                </CardTitle>
                <CardDescription>
                  Marcos que você já alcançou
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getAchievedMilestones().length > 0 ? (
                  <div className="space-y-4">
                    {getAchievedMilestones().map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border rounded bg-yellow-50">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-yellow-500" />
                          <div>
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Alcançado em {milestone.achieved_at && new Date(milestone.achieved_at).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Alcançado
                        </Badge>
                        </div>
                      ))}
                    </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum marco alcançado ainda</p>
                    <p className="text-sm">Continue usando a plataforma para alcançar marcos!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Próximos Marcos
                </CardTitle>
                <CardDescription>
                  Marcos que você pode alcançar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getPendingMilestones().length > 0 ? (
                  <div className="space-y-4">
                    {getPendingMilestones().map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex items-center gap-3">
                          <Clock className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress 
                                value={(milestone.current_value / milestone.target_value) * 100} 
                                className="w-20 h-2" 
                              />
                              <span className="text-xs text-muted-foreground">
                                {milestone.current_value}/{milestone.target_value}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">Pendente</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Todos os marcos alcançados!</p>
                    <p className="text-sm">Parabéns pelo seu progresso!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas de Atividade
              </CardTitle>
              <CardDescription>
                Suas estatísticas de uso da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {progress.reduce((sum, p) => sum + p.sessions_completed, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Sessões Concluídas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {progress.reduce((sum, p) => sum + p.chats_interactions, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Chats</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">
                    {progress.reduce((sum, p) => sum + p.resources_viewed, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Recursos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {progress.reduce((sum, p) => sum + p.milestones_achieved, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Marcos</p>
        </div>
      </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;