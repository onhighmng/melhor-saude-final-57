import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, HelpCircle, Video, X, User, MessageSquare, BookOpen, Bell, Brain, Heart, DollarSign, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings, Booking } from '@/hooks/useBookings';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { JourneyProgressBar } from '@/components/progress/JourneyProgressBar';
import { SimplifiedOnboarding, OnboardingData } from '@/components/onboarding/SimplifiedOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { SessionCard, SessionCardData } from '@/components/ui/session-card';
import { getPillarColors, cn } from '@/lib/utils';
import recursosWellness from '@/assets/recursos-wellness.jpg';
import cardBackground from '@/assets/card-background.png';
const UserDashboard = () => {
  const navigate = useNavigate();
  const {
    profile
  } = useAuth();
  const {
    sessionBalance
  } = useSessionBalance();
  const {
    upcomingBookings,
    allBookings,
    formatPillarName
  } = useBookings();
  const {
    toast
  } = useToast();
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
  
  // Session modal state
  const [selectedSession, setSelectedSession] = useState<Booking | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Default milestones structure
  const defaultMilestones = [{
    id: 'onboarding',
    label: 'Concluiu o onboarding',
    points: 10,
    completed: false
  }, {
    id: 'specialist',
    label: 'Falou com um especialista',
    points: 20,
    completed: false
  }, {
    id: 'first_session',
    label: 'Fez a primeira sessão',
    points: 25,
    completed: false
  }, {
    id: 'resources',
    label: 'Usou recursos da plataforma',
    points: 15,
    completed: false
  }, {
    id: 'ratings',
    label: 'Avaliou 3 sessões efetuadas',
    points: 20,
    completed: false
  }, {
    id: 'goal',
    label: 'Atingiu 1 objetivo pessoal',
    points: 10,
    completed: false
  }];

  // Initialize default milestones if none exist
  const initializeMilestones = () => {
    const stored = localStorage.getItem('journeyMilestones');
    if (!stored) {
      localStorage.setItem('journeyMilestones', JSON.stringify(defaultMilestones));
      return defaultMilestones;
    }
    return JSON.parse(stored);
  };

  // Get milestone progress from localStorage (persistent)
  const getMilestoneProgress = (milestonesData: any[]) => {
    return milestonesData.reduce((sum: number, m: any) => sum + (m.completed ? m.points : 0), 0);
  };

  // Initialize milestones from localStorage
  const [milestones, setMilestones] = useState<any[]>(() => initializeMilestones());
  const [milestoneProgress, setMilestoneProgress] = useState(getMilestoneProgress(milestones));
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
        const updatedMilestones = JSON.parse(stored);
        setMilestones(updatedMilestones);
        const progress = getMilestoneProgress(updatedMilestones);
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
    const statusMap: Record<string, {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }> = {
      'confirmed': {
        label: 'Confirmada',
        variant: 'secondary'
      },
      'completed': {
        label: 'Concluída',
        variant: 'default'
      },
      'cancelled': {
        label: 'Cancelada',
        variant: 'destructive'
      },
      'pending': {
        label: 'Pendente',
        variant: 'outline'
      }
    };
    return statusMap[status] || {
      label: status,
      variant: 'outline'
    };
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

  const getPillarIcon = (pillar: string) => {
    const iconMap: Record<string, any> = {
      'saude_mental': Brain,
      'bem_estar_fisico': Heart,
      'assistencia_financeira': DollarSign,
      'assistencia_juridica': Scale
    };
    return iconMap[pillar] || Calendar;
  };

  // Transform booking to session card data
  const transformBookingToSession = (booking: Booking): SessionCardData => {
    return {
      id: booking.id,
      pillar: booking.pillar,
      date: booking.date,
      time: booking.time,
      duration: 60,
      prestador: booking.provider_name,
      meetingType: booking.session_type === 'presencial' ? 'presencial' : 'virtual',
      meetingPlatform: booking.session_type === 'presencial' ? undefined : 'zoom',
      meetingLink: booking.session_type === 'presencial' ? undefined : '#',
      status: booking.status === 'confirmed' ? 'confirmed' : 'pending',
      quota: 'Quota Empresa'
    };
  };

  // Session modal handlers
  const handleSessionClick = (booking: Booking) => {
    setSelectedSession(booking);
    setIsSessionModalOpen(true);
  };

  const handleReschedule = (sessionId: string) => {
    console.log('Reschedule session:', sessionId);
    toast({
      title: 'Reagendar Sessão',
      description: 'Funcionalidade de reagendamento em desenvolvimento'
    });
    setIsSessionModalOpen(false);
  };

  const handleJoinSession = (sessionId: string) => {
    console.log('Join session:', sessionId);
    toast({
      title: 'Entrar na Sessão',
      description: 'A abrir link da sessão...'
    });
    // In production, this would open the actual meeting link
  };

  const handleCancelSession = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
    toast({
      title: 'Cancelar Sessão',
      description: 'Tem a certeza que deseja cancelar esta sessão?'
    });
    setIsSessionModalOpen(false);
  };


  // Trigger confetti when user first lands on dashboard after onboarding
  useEffect(() => {
    if (justCompletedOnboarding) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100
      };
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
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          }
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [justCompletedOnboarding]);

  // Calculate sessions based on mock data structure
  const remainingSessions = sessionBalance?.totalRemaining || 0;
  const totalSessions = 28; // Mock total from design
  const usedSessions = totalSessions - remainingSessions;
  const usagePercent = totalSessions > 0 ? Math.round(usedSessions / totalSessions * 100) : 0;

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return <SimplifiedOnboarding onComplete={handleOnboardingComplete} />;
  }
  return <div className="relative w-full min-h-screen h-full flex flex-col">
    {/* Background that covers main content area */}
    <div 
      className="absolute inset-0 w-full h-full"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 900\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23F0F9FF;stop-opacity:1\' /%3E%3Cstop offset=\'20%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'40%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'60%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'80%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230EA5E9;stop-opacity:1\' /%3E%3C/linearGradient%3E%3CradialGradient id=\'highlight\' cx=\'50%25\' cy=\'20%25\' r=\'60%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0.3\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23blueGrad)\'/%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23highlight)\'/%3E%3C/svg%3E")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    />
    
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
    
    {/* Content */}
    <div className="relative z-10 h-full flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
        {/* Welcome Header */}
        <div className="space-y-1 flex-shrink-0">
          <h1 className="text-2xl font-normal tracking-tight">
            Olá, {profile?.name || 'ana.silva'}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Bem-vinda de volta ao seu espaço de saúde e bem-estar.
          </p>
        </div>


        {/* Session Balance Card - Full Width */}
        <div ref={progressRef} className="flex-shrink-0">
          <Card className="w-full border shadow-sm overflow-hidden relative">
            <div className="absolute inset-0">
              <img src={cardBackground} alt="" className="w-full h-full object-cover" />
            </div>
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-[#4A90E2] flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-50 font-bold">Progresso Pessoal</span>
                  <span className="font-mono text-xl font-semibold text-zinc-50">{Math.round(animatedMilestoneProgress)}%</span>
                </div>
                <Progress value={animatedMilestoneProgress} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="font-mono text-6xl font-semibold text-white">{remainingSessions}</div>
                <div className="text-lg font-serif text-white">Sessões</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <InteractiveHoverButton text="Falar com Especialista" className="w-full" onClick={() => navigate('/user/chat')} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Grid Layout */}
        <div className="flex-1 min-h-0">
          <BentoGrid className="lg:grid-rows-3 h-full grid-rows-[10rem] lg:auto-rows-[minmax(14rem,1fr)]">
          {/* Top Left - Session History */}
          <BentoCard 
            name="Histórico de Sessões" 
            description={`${completedSessions.length} sessões concluídas`}
            Icon={Calendar} 
            onClick={() => navigate('/user/sessions')} 
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50" />}
            iconColor="text-black"
            textColor="text-black"
            descriptionColor="text-black/70"
            href="#"
            cta=""
          />

          {/* Top Right - Notifications */}
          <BentoCard 
            name="Notificações" 
            description="Fique atualizado com as suas últimas atividades" 
            Icon={Bell} 
            onClick={() => navigate('/user/notifications')} 
            className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2" 
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50" />}
            iconColor="text-black"
            textColor="text-black"
            descriptionColor="text-black/70"
            href="#"
            cta=""
          />

          {/* Middle - Progress (Progreso Pessoal) */}
          <BentoCard name="" description="" href="#" cta="" className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3" background={<div className="absolute inset-0 flex flex-col p-8 overflow-y-auto">
                <h3 className="text-2xl font-semibold mb-2">Progresso Pessoal</h3>
                <p className="text-base text-muted-foreground mb-6 italic">"Pequenos passos todos os dias levam a grandes conquistas"</p>
                <div className="flex-1 flex flex-col justify-start min-h-0">
                  <div className="w-full space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium">Progresso</span>
                        <span className="font-mono text-xl font-semibold text-[#4A90E2]">{Math.round(animatedMilestoneProgress)}%</span>
                      </div>
                      <Progress value={animatedMilestoneProgress} className="h-3" />
                    </div>
                    
                    <div className="space-y-3 overflow-y-auto pr-2">
                      {milestones.map((milestone: any) => (
                        <div key={milestone.id} className={`flex items-center gap-3 p-3.5 rounded-lg border text-sm ${milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white/50 border-gray-200'}`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${milestone.completed ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                            {milestone.completed && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`flex-1 ${milestone.completed ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                            {milestone.label}
                          </span>
                          <span className={`text-sm font-semibold ${milestone.completed ? 'text-green-600' : 'text-gray-500'}`}>
                            +{milestone.points}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>} />

          {/* Bottom Left - Resources */}
          <BentoCard name="Recursos" description="" href="#" cta="" Icon={BookOpen} onClick={() => navigate('/user/resources')} className="lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4" textColor="text-white" iconColor="text-white" background={<div className="absolute inset-0">
                <img src={recursosWellness} alt="Wellness activities" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>} />

          {/* Bottom Right - Upcoming Sessions */}
          <BentoCard name="" description="" href="#" cta="" onClick={() => navigate('/user/sessions')} className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4" background={<div className="absolute inset-0 p-5 flex flex-col">
                  <h3 className="text-xl font-semibold mb-4">Próximas Sessões</h3>
                  <div className="flex-1 min-h-0">
                    {upcomingBookings && upcomingBookings.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 h-full">
                        {upcomingBookings.slice(0, 4).map(booking => {
                          const pillarColors = getPillarColors(booking.pillar);
                          const PillarIcon = getPillarIcon(booking.pillar);
                          return <div key={booking.id} onClick={(e) => { e.stopPropagation(); handleSessionClick(booking); }} className={cn('flex items-center gap-3 rounded-xl p-3 transition-all cursor-pointer hover:scale-[1.02] bg-white/80 backdrop-blur-sm border', pillarColors.border)}>
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', pillarColors.bgSolid)}>
                              <PillarIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">{booking.date}</div>
                              <div className="text-xs text-muted-foreground">{booking.time}</div>
                            </div>
                          </div>;
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        Nenhuma sessão agendada
                      </div>
                    )}
                  </div>
                </div>} />
          </BentoGrid>
        </div>
      </div>
    </div>

    {/* Session Details Modal */}
    <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        {selectedSession && (
          <SessionCard
            session={transformBookingToSession(selectedSession)}
            onReschedule={handleReschedule}
            onJoin={handleJoinSession}
            onCancel={handleCancelSession}
            className="w-full"
          />
        )}
      </DialogContent>
    </Dialog>
    </div>;
};
export default UserDashboard;