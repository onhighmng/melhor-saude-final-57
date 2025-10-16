import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, HelpCircle, Video, X, User, MessageSquare, BookOpen, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings } from '@/hooks/useBookings';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { JourneyProgressBar } from '@/components/progress/JourneyProgressBar';
import { SimplifiedOnboarding, OnboardingData } from '@/components/onboarding/SimplifiedOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import recursosWellness from '@/assets/recursos-wellness.jpg';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessionBalance } = useSessionBalance();
  const { upcomingBookings, allBookings, formatPillarName } = useBookings();
  const { toast } = useToast();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(() => {
    const stored = localStorage.getItem('onboardingData');
    return stored ? JSON.parse(stored) : null;
  });
  
  // Check if this specific user has completed onboarding
  const userOnboardingKey = `onboarding_completed_${profile?.email || 'demo'}`;
  const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey) === 'true';
  
  // Only show onboarding for users with 'user' role who haven't completed it
  const shouldShowOnboarding = profile?.role === 'user' && !hasCompletedOnboarding;
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding);
  const [justCompletedOnboarding, setJustCompletedOnboarding] = useState(false);

  // Get milestone progress from sessionStorage (resets on logout)
  const getMilestoneProgress = () => {
    const stored = sessionStorage.getItem('journeyMilestones');
    if (stored) {
      const milestones = JSON.parse(stored);
      return milestones.reduce((sum: number, m: any) => sum + (m.completed ? m.points : 0), 0);
    }
    // Initialize from localStorage if not in session
    const localStored = localStorage.getItem('journeyMilestones');
    if (localStored) {
      const milestones = JSON.parse(localStored);
      // Reset all milestones except onboarding for new session
      const sessionMilestones = milestones.map((m: any) => ({
        ...m,
        completed: m.id === 'onboarding' ? m.completed : false
      }));
      sessionStorage.setItem('journeyMilestones', JSON.stringify(sessionMilestones));
      return sessionMilestones.reduce((sum: number, m: any) => sum + (m.completed ? m.points : 0), 0);
    }
    return 0;
  };
  
  const [milestoneProgress, setMilestoneProgress] = useState(getMilestoneProgress());
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedMilestoneProgress, setAnimatedMilestoneProgress] = useState(0);
  const [progressRef, isProgressVisible] = useScrollAnimation(0.3);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleOnboardingComplete = (data: OnboardingData) => {
    const userOnboardingKey = `onboarding_completed_${profile?.email || 'demo'}`;
    localStorage.setItem('onboardingData', JSON.stringify(data));
    localStorage.setItem(userOnboardingKey, 'true');
    setOnboardingData(data);
    setShowOnboarding(false);
    setJustCompletedOnboarding(true);
  };

  // Listen for milestone completion events
  useEffect(() => {
    const handleMilestoneCompleted = () => {
      const stored = localStorage.getItem('journeyMilestones');
      if (stored) {
        // Update sessionStorage with the new milestone
        sessionStorage.setItem('journeyMilestones', stored);
        const progress = getMilestoneProgress();
        setMilestoneProgress(progress);
      }
    };

    window.addEventListener('milestoneCompleted', handleMilestoneCompleted);
    return () => {
      window.removeEventListener('milestoneCompleted', handleMilestoneCompleted);
    };
  }, []);

  // Animate progress bar when scrolled into view with smooth 4-second animation
  useEffect(() => {
    if (!isProgressVisible || hasAnimated || milestoneProgress === 0) return;
    
    setHasAnimated(true);
    setAnimatedProgress(0);
    setAnimatedMilestoneProgress(0);
    const startTime = Date.now();
    const duration = 4000; // 4 seconds total animation
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      setAnimatedProgress(milestoneProgress * easedProgress);
      setAnimatedMilestoneProgress(milestoneProgress * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isProgressVisible, milestoneProgress, hasAnimated]);

  const completedSessions = allBookings?.filter(b => b.status === 'completed') || [];
  const recentCompleted = completedSessions.slice(0, 2);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'confirmed': { label: 'Confirmada', variant: 'secondary' },
      'completed': { label: 'Concluída', variant: 'default' },
      'cancelled': { label: 'Cancelada', variant: 'destructive' },
      'pending': { label: 'Pendente', variant: 'outline' },
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

  // Trigger confetti when user first lands on dashboard after onboarding
  useEffect(() => {
    if (justCompletedOnboarding) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          setJustCompletedOnboarding(false); // Reset flag
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [justCompletedOnboarding]);

  // Calculate sessions based on mock data structure
  const remainingSessions = sessionBalance?.totalRemaining || 0;
  const totalSessions = 28; // Mock total from design
  const usedSessions = totalSessions - remainingSessions;
  const usagePercent = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return <SimplifiedOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-normal tracking-tight">
            Olá, {profile?.name || 'ana.silva'}! 👋
          </h1>
          <p className="text-muted-foreground text-base">
            Bem-vinda de volta ao seu espaço de saúde e bem-estar.
          </p>
        </div>


        {/* Session Balance Card - Centered */}
        <div className="flex justify-center" ref={progressRef}>
          <Card className="w-full max-w-4xl border shadow-sm bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-16 pb-12 flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-[#4A90E2] flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso Pessoal</span>
                  <span className="text-lg font-bold text-[#4A90E2]">{Math.round(animatedMilestoneProgress)}%</span>
                </div>
                <Progress value={animatedMilestoneProgress} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="text-8xl font-bold text-[#4A90E2]">{remainingSessions}</div>
                <div className="text-2xl font-serif">Sessões</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <InteractiveHoverButton 
                  text="Falar com Especialista"
                  className="w-full"
                  onClick={() => navigate('/user/chat')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Grid Layout */}
        <BentoGrid className="lg:grid-rows-3">
          {/* Top Left - Session History */}
          <BentoCard
            name="Histórico de Sessões"
            description={`${completedSessions.length} sessões concluídas`}
            Icon={Calendar}
            onClick={() => navigate('/user/sessions')}
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />}
          />

          {/* Top Right - Notifications */}
          <BentoCard
            name="Notificações"
            description="Fique atualizado com as suas últimas atividades"
            Icon={Bell}
            onClick={() => navigate('/user/notifications')}
            className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50" />}
          />

          {/* Middle - Progress (Progreso Pessoal) */}
          <BentoCard
            name="Progresso Pessoal"
            description={`${Math.round(animatedMilestoneProgress)}% concluído - Continue sua jornada de bem-estar`}
            Icon={Calendar}
            className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
            background={
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-lg font-bold text-[#4A90E2]">{Math.round(animatedMilestoneProgress)}%</span>
                  </div>
                  <Progress value={animatedMilestoneProgress} className="h-2" />
                </div>
              </div>
            }
          />

          {/* Bottom Left - Resources */}
          <BentoCard
            name="Recursos"
            description=""
            Icon={BookOpen}
            onClick={() => navigate('/user/resources')}
            className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4"
            textColor="text-white"
            iconColor="text-white"
            background={
              <div className="absolute inset-0">
                <img 
                  src={recursosWellness} 
                  alt="Wellness activities" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            }
          />

          {/* Bottom Right - Upcoming Sessions */}
          <BentoCard
            name="Próximas Sessões"
            description={upcomingBookings && upcomingBookings.length > 0 ? `${upcomingBookings.length} sessões agendadas` : 'Nenhuma sessão agendada'}
            Icon={Calendar}
            onClick={() => navigate('/user/sessions')}
            className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
            background={
              <div className="absolute inset-0 p-6">
                <div className="space-y-3 mt-20">
                  {upcomingBookings && upcomingBookings.length > 0 ? (
                    upcomingBookings.slice(0, 2).map((booking) => {
                      const isTodaySession = isToday(booking.date);
                      const canJoinNow = isWithin5Minutes(booking.date, booking.time);
                      
                      return (
                        <div key={booking.id} className={`flex items-center gap-3 rounded-lg p-3 ${canJoinNow ? 'bg-green-50/80' : isTodaySession ? 'bg-blue-50/80' : 'bg-white/50'}`}>
                          <div className="w-8 h-8 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-[#4A90E2]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{formatPillarName(booking.pillar)}</div>
                            <div className="text-xs text-muted-foreground">{booking.time}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      Nenhuma sessão agendada
                    </div>
                  )}
                </div>
              </div>
            }
          />
        </BentoGrid>
      </div>
    </div>
  );
};

export default UserDashboard;
