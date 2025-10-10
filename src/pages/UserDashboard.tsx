import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, HelpCircle, Video, X, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings } from '@/hooks/useBookings';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { SessionMilestones } from '@/components/progress/SessionMilestones';
import { SimplifiedOnboarding, OnboardingData } from '@/components/onboarding/SimplifiedOnboarding';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessionBalance } = useSessionBalance();
  const { upcomingBookings, allBookings, formatPillarName } = useBookings();
  const { t } = useTranslation('user');
  const { t: tNav } = useTranslation('navigation');
  const { t: tUser } = useTranslation('user');
  const { toast } = useToast();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(() => {
    const stored = localStorage.getItem('onboardingData');
    return stored ? JSON.parse(stored) : null;
  });
  const [showOnboarding, setShowOnboarding] = useState(!onboardingData);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  const handleOnboardingComplete = (data: OnboardingData) => {
    localStorage.setItem('onboardingData', JSON.stringify(data));
    setOnboardingData(data);
    setShowOnboarding(false);
    setShowCompletionScreen(true);
  };

  const handleCompletionContinue = () => {
    setShowCompletionScreen(false);
  };

  const completedSessions = allBookings?.filter(b => b.status === 'completed') || [];
  const recentCompleted = completedSessions.slice(0, 2);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'confirmed': { label: t('sessions.statusConfirmed'), variant: 'secondary' },
      'completed': { label: t('sessions.statusCompleted'), variant: 'default' },
      'cancelled': { label: t('sessions.statusCancelled'), variant: 'destructive' },
      'pending': { label: t('sessions.statusPending'), variant: 'outline' },
    };
    return statusMap[status] || { label: status, variant: 'outline' };
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWithin5Minutes = (dateStr: string, timeStr: string) => {
    const sessionDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diffMinutes = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);
    
    // Session starts within 5 minutes (but not passed)
    return diffMinutes <= 5 && diffMinutes >= -60; // Can join up to 1 hour after start
  };

  // Calculate sessions based on mock data structure
  const remainingSessions = sessionBalance?.totalRemaining || 0;
  const totalSessions = 28; // Mock total from design
  const usedSessions = totalSessions - remainingSessions;
  const usagePercent = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return <SimplifiedOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Show completion screen after onboarding
  if (showCompletionScreen) {
    return <OnboardingComplete onContinue={handleCompletionContinue} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-normal tracking-tight">
            {t('dashboard.welcome', { name: profile?.name || 'ana.silva' })}
          </h1>
          <p className="text-muted-foreground text-base">
            {t('dashboard.welcomeBack')}
          </p>
        </div>

        {/* Session Balance Card - Centered */}
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl border shadow-sm bg-card">
            <CardContent className="pt-16 pb-12 flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-[#4A90E2] flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-1">
                <div className="text-8xl font-bold text-[#4A90E2]">{remainingSessions}</div>
                <div className="text-2xl font-serif">{t('dashboard.sessionsRemaining')}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button 
                  size="lg" 
                  className="flex-1 px-6 py-6 text-base rounded-xl bg-[#4A90E2] hover:bg-[#3A7BC8] text-white"
                  onClick={() => navigate('/user/book')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  {tNav('actions.talkToSpecialist')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Milestones - Replaces session balance progress */}
        <SessionMilestones />

        {/* Progress Bar - Growth Journey with Feedback Milestones */}
        <ProgressBar />

        {/* Seus Prestadores por Pilar */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4A90E2] flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-normal">{t('dashboard.providersTitle')}</h2>
              <p className="text-muted-foreground text-base">{t('dashboard.providersSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Próximas Sessões */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-normal">
                <div className="w-12 h-12 rounded-2xl bg-[#4A90E2] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                {t('sessions.upcomingTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {upcomingBookings && upcomingBookings.length > 0 ? (
                upcomingBookings.slice(0, 3).map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const isTodaySession = isToday(booking.date);
                  const canJoinNow = isWithin5Minutes(booking.date, booking.time);
                  
                  return (
                    <Card 
                      key={booking.id} 
                      className={`${booking.status === 'cancelled' ? 'bg-muted/30 border-muted' : canJoinNow ? 'border-[#22C55E] border-2 bg-[#F0FDF4]' : isTodaySession ? 'border-[#4A90E2] bg-[#EFF6FF]' : 'border bg-background'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-0.5">
                            <div className="font-medium text-base">
                              {new Date(booking.date).getDate()} de {new Date(booking.date).toLocaleDateString('pt-PT', { month: 'short' })}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {booking.time}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {canJoinNow && booking.status === 'confirmed' && (
                              <Badge className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-3">{t('sessions.startingSoonBadge')}</Badge>
                            )}
                            {isTodaySession && !canJoinNow && booking.status === 'confirmed' && (
                              <Badge className="bg-[#4A90E2] hover:bg-[#3A7BC8] text-white rounded-full px-3">{t('sessions.todayBadge')}</Badge>
                            )}
                            <Badge 
                              variant={statusBadge.variant}
                              className={statusBadge.variant === 'secondary' ? 'bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] rounded-full' : statusBadge.variant === 'destructive' ? 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] rounded-full' : ''}
                            >
                              {statusBadge.label}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-0.5 mb-4">
                          <div className="font-medium text-[#4A90E2]">{formatPillarName(booking.pillar)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {booking.provider_name}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {canJoinNow && booking.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg"
                              onClick={() => window.open('https://meet.google.com/demo-session-link', '_blank')}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              {t('sessions.ctaJoinSession')}
                            </Button>
                          )}
                          {!canJoinNow && booking.status === 'confirmed' && (
                            <Button size="sm" variant="outline" className="flex-1 text-[#DC2626] border-[#DC2626] hover:bg-[#FEE2E2] rounded-lg">
                              <X className="w-4 h-4 mr-2" />
                              {t('sessions.ctaCancelSession')}
                            </Button>
                          )}
                          {!canJoinNow && booking.status === 'confirmed' && (
                            <Button size="sm" variant="outline" className="flex-1 rounded-lg">
                              {t('sessions.ctaViewDetails')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">{t('sessions.noUpcoming')}</p>
                  <Button onClick={() => navigate('/user/book-session')} variant="outline">
                    {tUser('dashboard.ctaBookSession')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico Rápido */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-normal">{t('sessions.historyTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('sessions.completedCount', { count: completedSessions.length })}</p>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
              {recentCompleted.length > 0 ? (
                <>
                  {recentCompleted.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4A90E2]/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#4A90E2]" />
                        </div>
                        <div>
                          <div className="font-medium">{formatPillarName(session.pillar)}</div>
                          <div className="text-sm text-muted-foreground">{session.provider_name}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.date).getDate()}/{String(new Date(session.date).getMonth() + 1).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                  {completedSessions.length > 2 && (
                    <Button 
                      variant="link" 
                      className="w-full text-[#4A90E2] p-0 h-auto mt-2 hover:no-underline"
                      onClick={() => navigate('/user/sessions')}
                    >
                      {t('sessions.viewMore', { count: completedSessions.length - 2 })}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">{t('sessions.noHistory')}</p>
                  <Button onClick={() => navigate('/user/book-session')} variant="outline" size="sm">
                    {tUser('dashboard.ctaBookSession')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ajuda & Recursos */}
        <Card className="border shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-normal mb-2">{t('dashboard.helpTitle')}</h2>
                <p className="text-muted-foreground mb-4 text-base">
                  {t('dashboard.helpSubtitle')}
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-white/90 border-gray-200"
                  onClick={() => navigate('/user/resources')}
                >
                  {t('dashboard.ctaExploreResources')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
