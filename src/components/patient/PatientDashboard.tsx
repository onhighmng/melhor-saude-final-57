
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PageSkeleton from '@/components/ui/page-skeleton';
import SessionBalanceDisplay from '@/components/ui/session-balance-display';
import AppointmentsList from './AppointmentsList';
import SelfHelpHub from './SelfHelpHub';
import PsychologicalTestInterface from './PsychologicalTestInterface';
import { useToast } from '@/hooks/use-toast';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useHealthData } from '@/hooks/useHealthData';
import { useAchievements } from '@/hooks/useAchievements';
import { useActivity } from '@/hooks/useActivity';
import { useBookings } from '@/hooks/useBookings';
import { getErrorMessage } from '@/utils/errorMessages';
import { 
  Calendar, 
  Clock, 
  User, 
  Award, 
  TrendingUp, 
  Heart, 
  Smile, 
  Meh, 
  Frown,
  Target,
  Activity,
  CheckCircle,
  Timer,
  Users,
  Brain,
  Building,
  Trophy,
  Star,
  BookOpen
} from 'lucide-react';

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

const PatientDashboard = ({ user, onLogout }: PatientDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
  // Use real data hooks
  const { sessionBalance, loading: sessionLoading } = useSessionBalance();
  const { 
    latestCheckin, 
    healthHistory,
    healthStats, 
    hasCheckedInToday, 
    submitHealthCheckin, 
    loading: healthLoading,
    submitting 
  } = useHealthData();
  const { recentAchievements, achievementStats, loading: achievementsLoading } = useAchievements();
  const { activities, activityStats, loading: activityLoading, formatActivityDescription, getActivityIcon } = useActivity();
  const { upcomingBookings, bookingStats, loading: bookingsLoading, formatPillarName, getTimeUntilAppointment } = useBookings();
  
  // Health check-in state
  const [healthCheckIn, setHealthCheckIn] = useState({
    mood: latestCheckin?.mood_rating || 4,
    energy: latestCheckin?.energy_level || 3,
    stress: latestCheckin?.stress_level || 2,
    sleep: latestCheckin?.sleep_quality || 4,
    notes: ''
  });

  // Handle health check-in submission
  const handleHealthCheckInSubmit = async () => {
    try {
      const success = await submitHealthCheckin({
        mood_rating: healthCheckIn.mood,
        energy_level: healthCheckIn.energy,
        stress_level: healthCheckIn.stress,
        sleep_quality: healthCheckIn.sleep,
        notes: healthCheckIn.notes || undefined
      });

      if (success) {
        toast({
          title: "Check-in submitted!",
          description: "Your daily health check-in has been recorded.",
        });
        setHealthCheckIn({ ...healthCheckIn, notes: '' });
      } else {
        toast({
          title: "Erro",
          description: getErrorMessage("Failed to submit check-in. Please try again."),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting health check-in:', error);
      toast({
        title: "Erro",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  };

  // Generate recommended actions based on real data
  const getRecommendedActions = () => {
    const actions = [];
    
    // Check stress levels from latest check-in
    if (latestCheckin && latestCheckin.stress_level >= 4) {
      actions.push({
        id: 'stress-session',
        title: 'Agendar Sessão Psicológica',
        description: 'Os seus níveis de stress recentes indicam que pode beneficiar de apoio profissional',
        priority: 'high',
        icon: Brain
      });
    }

    // Check if no sessions this month
    if (sessionBalance && sessionBalance.totalRemaining > 0 && bookingStats.upcomingBookings === 0) {
      actions.push({
        id: 'book-session',
        title: 'Marcar Próxima Sessão',
        description: `Tem ${sessionBalance.totalRemaining} sessões disponíveis`,
        priority: 'medium',
        icon: Calendar
      });
    }

    // Check check-in streak
    if (!hasCheckedInToday()) {
      actions.push({
        id: 'daily-checkin',
        title: 'Completar Check-in Diário',
        description: 'Mantenha a sua sequência de bem-estar',
        priority: 'medium',
        icon: Heart
      });
    }

    // Financial planning reminder
    if (sessionBalance && sessionBalance.employerRemaining === 0 && sessionBalance.personalRemaining === 0) {
      actions.push({
        id: 'plan-sessions',
        title: 'Planear Orçamento de Sessões',
        description: 'Considere adquirir sessões adicionais',
        priority: 'low',
        icon: Target
      });
    }

    return actions.slice(0, 3); // Limit to 3 actions
  };

  const recommendedActions = getRecommendedActions();

  const handleLogout = () => {
    console.log('🚪 Patient dashboard logout clicked');
    onLogout();
  };

  const handleBookSession = () => {
    // Navigate to the unified booking flow (pillar selection)
    navigate('/user/book');
  };

  const handleTestComplete = () => {
    setSelectedTest(null);
    // Refresh any data if needed
  };

  // Add loading state wrapper
  if (sessionLoading || healthLoading || achievementsLoading || activityLoading || bookingsLoading) {
    return (
      <ErrorBoundary>
        <PageSkeleton variant="dashboard" />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 sm:space-y-8">
        {/* Streamlined Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-blue">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-navy-blue/70">
              <span className="font-medium">Consultas disponíveis:</span>
              <SessionBalanceDisplay
                sessionBalance={sessionBalance}
                loading={sessionLoading}
                showActionButton={false}
                className="inline-flex items-center"
              />
            </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-white/20 backdrop-blur-md border-accent-sage/20 shrink-0"
        >
          Sair
        </Button>
      </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
        {/* Session Usage Dashboard */}
        <Card className="glass-effect border-accent-sage/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-navy-blue flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Suas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionBalanceDisplay
              sessionBalance={sessionBalance}
              loading={sessionLoading}
              showActionButton={true}
              onActionClick={handleBookSession}
            />
          </CardContent>
        </Card>

        {/* Quick Health Check-in */}
        <Card className="glass-effect border-accent-sage/20">
          <CardHeader>
            <CardTitle className="text-navy-blue flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Check-in Diário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-sage mx-auto"></div>
              </div>
            ) : hasCheckedInToday() ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-navy-blue font-medium">Check-in realizado!</p>
                <p className="text-navy-blue/70 text-sm">Obrigado por compartilhar</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Streak:</span>
                    <span className="font-medium">{healthStats.streakDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Mood:</span>
                    <span className="font-medium">{healthStats.averageMood.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mood (1-5)</label>
                    <Slider
                      value={[healthCheckIn.mood]}
                      onValueChange={([value]) => setHealthCheckIn({...healthCheckIn, mood: value})}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-navy-blue/70">{healthCheckIn.mood}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Energy (1-5)</label>
                    <Slider
                      value={[healthCheckIn.energy]}
                      onValueChange={([value]) => setHealthCheckIn({...healthCheckIn, energy: value})}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-navy-blue/70">{healthCheckIn.energy}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stress (1-5)</label>
                    <Slider
                      value={[healthCheckIn.stress]}
                      onValueChange={([value]) => setHealthCheckIn({...healthCheckIn, stress: value})}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-navy-blue/70">{healthCheckIn.stress}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sleep Quality (1-5)</label>
                    <Slider
                      value={[healthCheckIn.sleep]}
                      onValueChange={([value]) => setHealthCheckIn({...healthCheckIn, sleep: value})}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-navy-blue/70">{healthCheckIn.sleep}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    placeholder="How are you feeling today? Any specific concerns?"
                    value={healthCheckIn.notes}
                    onChange={(e) => setHealthCheckIn({...healthCheckIn, notes: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={handleHealthCheckInSubmit}
                  className="w-full bg-gradient-to-r from-accent-sage to-mint-green text-white"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Check-in'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health History Section */}
      <Card className="glass-effect border-accent-sage/20 mb-6">
        <CardHeader>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Histórico de Bem-estar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-sage mx-auto"></div>
            </div>
          ) : healthHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-navy-blue/70 text-sm">Total Check-ins</div>
                  <div className="font-bold text-navy-blue text-lg">{healthStats.totalCheckins}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-navy-blue/70 text-sm">Humor Médio</div>
                  <div className="font-bold text-navy-blue text-lg">{healthStats.averageMood.toFixed(1)}/5</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-navy-blue/70 text-sm">Sequência Atual</div>
                  <div className="font-bold text-navy-blue text-lg">{healthStats.streakDays} dias</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-navy-blue/70 text-sm">Últimos 7 dias</div>
                  <div className="font-bold text-navy-blue text-lg">{healthHistory.length}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-navy-blue">Histórico Recente</h4>
                <div className="space-y-2">
                  {healthHistory.slice(0, 5).map((checkin, index) => {
                    const date = new Date(checkin.created_at);
                    const getMoodIcon = (mood: number) => {
                      if (mood >= 4) return <Smile className="w-4 h-4 text-green-600" />;
                      if (mood >= 3) return <Meh className="w-4 h-4 text-yellow-600" />;
                      return <Frown className="w-4 h-4 text-red-600" />;
                    };
                    
                    return (
                      <div key={checkin.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMoodIcon(checkin.mood_rating)}
                          <div>
                            <div className="font-medium text-navy-blue text-sm">
                              {date.toLocaleDateString('pt-PT')}
                            </div>
                            <div className="text-navy-blue/70 text-xs">
                              {index === 0 && hasCheckedInToday() ? 'Hoje' : 
                               index === 1 ? 'Ontem' : 
                               `${Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} dias atrás`}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-navy-blue/70">
                          <span>Humor: {checkin.mood_rating}/5</span>
                          <span>Energia: {checkin.energy_level}/5</span>
                          <span>Stress: {checkin.stress_level}/5</span>
                          <span>Sono: {checkin.sleep_quality}/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-navy-blue/40 mx-auto mb-4" />
              <p className="text-navy-blue/70">Comece a fazer check-ins diários para ver o seu histórico aqui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments Countdown */}
      {bookingStats.nextAppointment && (
        <Card className="glass-effect border-accent-sage/20 mb-6">
          <CardHeader>
            <CardTitle className="text-navy-blue flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Próxima Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="md:col-span-2">
                <h3 className="font-bold text-navy-blue text-lg">{bookingStats.nextAppointment.prestadores?.name || 'Provider'}</h3>
                <p className="text-navy-blue/70">{formatPillarName(bookingStats.nextAppointment.prestadores?.pillar)}</p>
                <p className="text-navy-blue/70">{new Date(bookingStats.nextAppointment.booking_date).toLocaleDateString('pt-PT')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-sage">{getTimeUntilAppointment(bookingStats.nextAppointment.booking_date)}</div>
                <p className="text-navy-blue/70 text-sm">até a sessão</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate('/user/book')}
                >
                  Reagendar
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-accent-sky to-vibrant-blue text-white"
                  onClick={() => navigate(`/user/sessions`)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Badges */}
      <Card className="glass-effect border-accent-sage/20 mb-6">
        <CardHeader>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            <Award className="w-5 h-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievementsLoading ? (
              <div className="col-span-full text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-sage mx-auto"></div>
              </div>
            ) : recentAchievements.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 text-sm">Ainda não tem conquistas.</p>
                <p className="text-gray-400 text-xs">Continue a usar a plataforma para desbloquear conquistas!</p>
              </div>
            ) : recentAchievements.map((achievement) => {
              const getIcon = (iconName?: string) => {
                switch (iconName) {
                  case 'Heart': return Heart;
                  case 'Trophy': return Trophy;
                  case 'Calendar': return Calendar;
                  case 'Target': return Target;
                  case 'Award': return Award;
                  default: return Star;
                }
              };
              
              // Translate achievement titles and descriptions to Portuguese
              const translateAchievement = (title: string, description: string) => {
                const translations: Record<string, { title: string; description: string }> = {
                  'Health Journey Started': {
                    title: 'Jornada de Saúde Iniciada',
                    description: 'Completou o seu primeiro check-in de saúde'
                  },
                  'First Week Complete': {
                    title: 'Primeira Semana Completa',
                    description: 'Completou check-ins durante 7 dias consecutivos'
                  },
                  'Consistency Champion': {
                    title: 'Campeão da Consistência',
                    description: 'Completou check-ins durante 30 dias consecutivos'
                  },
                  'Mood Tracker': {
                    title: 'Rastreador de Humor',
                    description: 'Registou o seu humor durante 14 dias'
                  }
                };
                
                return translations[title] || { title, description };
              };
              
              const translated = translateAchievement(achievement.achievement_title, achievement.achievement_description);
              const IconComponent = getIcon(achievement.icon_name);
              
              return (
                <div
                  key={achievement.id}
                  className="text-center p-4 rounded-lg transition-all bg-gradient-to-b from-yellow-100 to-yellow-50 border-2 border-yellow-300"
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <h4 className="font-medium text-sm mb-1 text-navy-blue">
                    {translated.title}
                  </h4>
                  <p className="text-xs text-navy-blue/70">
                    {translated.description}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {new Date(achievement.earned_at).toLocaleDateString('pt-PT')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="glass-effect border-accent-sage/20 mb-6">
        <CardHeader>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ações Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedActions.map((action) => {
              const IconComponent = action.icon;
              const priorityColor = {
                high: 'border-red-200 bg-red-50',
                medium: 'border-yellow-200 bg-yellow-50',
                low: 'border-blue-200 bg-blue-50'
              };
              
              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-lg border-2 ${priorityColor[action.priority as keyof typeof priorityColor]} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-6 h-6 text-navy-blue" />
                    <div>
                      <h4 className="font-medium text-navy-blue">{action.title}</h4>
                      <p className="text-navy-blue/70 text-sm">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleBookSession}
                    className="bg-gradient-to-r from-accent-sky to-vibrant-blue text-white"
                  >
                    {action.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card className="glass-effect border-accent-sage/20 mb-6">
        <CardHeader>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-sage mx-auto"></div>
              </div>
            ) : activities.slice(0, 5).map((activity, index) => {
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case 'Heart': return Heart;
                  case 'Calendar': return Calendar;
                  case 'CheckCircle': return CheckCircle;
                  case 'Trophy': return Trophy;
                  case 'User': return User;
                  default: return Activity;
                }
              };
              const IconComponent = getIcon(getActivityIcon(activity.activity_type));
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-accent-sage/20">
                      <IconComponent className="w-5 h-5 text-accent-sage" />
                    </div>
                    {index < Math.min(activities.length - 1, 4) && (
                      <div className="absolute top-10 left-5 w-0.5 h-8 bg-accent-sage/20"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-navy-blue">{formatActivityDescription(activity)}</h4>
                    <p className="text-navy-blue/70 text-sm">
                      {new Date(activity.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-effect border-accent-sage/20">
        <CardHeader>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleBookSession}
              className="bg-gradient-to-r from-accent-sky to-vibrant-blue text-white h-12"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
            <Button 
              variant="outline"
              onClick={() => setActiveSection('appointments')}
              className="bg-white/20 backdrop-blur-md border-accent-sage/20 h-12"
            >
              <Clock className="w-4 h-4 mr-2" />
              Ver Consultas
            </Button>
            <Button 
              variant="outline"
              onClick={() => setActiveSection('selfhelp')}
              className="bg-white/20 backdrop-blur-md border-accent-sage/20 h-12"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Autoajuda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Self-Help Hub Section */}
      {activeSection === 'selfhelp' && !selectedTest && (
        <Card className="glass-effect border-accent-sage/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setActiveSection('overview')}
                className="text-navy-blue/70 hover:text-navy-blue"
              >
                ← Voltar
              </Button>
              <CardTitle className="text-navy-blue">Centro de Autoajuda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SelfHelpHub />
          </CardContent>
        </Card>
      )}

      {/* Psychological Test Interface */}
      {selectedTest && (
        <PsychologicalTestInterface 
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
          onComplete={handleTestComplete}
        />
      )}

      {/* Appointments Section */}
      {activeSection === 'appointments' && (
        <Card className="glass-effect border-accent-sage/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setActiveSection('overview')}
                className="text-navy-blue/70 hover:text-navy-blue"
              >
                ← Voltar
              </Button>
              <CardTitle className="text-navy-blue">Minhas Consultas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AppointmentsList />
          </CardContent>
        </Card>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default PatientDashboard;
