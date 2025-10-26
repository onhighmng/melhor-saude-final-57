import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionModal } from "@/components/sessions/SessionModal";
import UserJourneySection from "@/components/ui/user-journey-section";
import { useBookings } from "@/hooks/useBookings";
import { useSessionBalance } from "@/hooks/useSessionBalance";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function UserSessions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { allBookings, upcomingBookings, loading: bookingsLoading } = useBookings();
  const { sessionBalance, loading: balanceLoading } = useSessionBalance();
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [isPastSessionsModalOpen, setIsPastSessionsModalOpen] = useState(false);
  const [isFutureSessionsModalOpen, setIsFutureSessionsModalOpen] = useState(false);
  
  // Load user goals from onboarding data
  useEffect(() => {
    const loadGoals = async () => {
      if (!profile?.id) return;
      
      const { data } = await supabase
        .from('onboarding_data')
        .select('health_goals, pillar_preferences')
        .eq('user_id', profile.id)
        .maybeSingle();
      
      if (data?.health_goals) {
        setUserGoals(data.health_goals.map((goal: string, index: number) => ({
          id: `${index}`,
          title: goal,
          pillar: data.pillar_preferences?.[index] || 'saude_mental',
          targetSessions: 6,
          completedSessions: allBookings.filter(b => b.status === 'completed').length,
          progressPercentage: 70,
          progressEmojis: ['😟', '🙂', '😄']
        })));
      }
    };
    
    loadGoals();
  }, [profile?.id, allBookings]);
  
  // Convert bookings to sessions format
  const sessions = allBookings.map(booking => ({
    id: booking.id,
    userId: booking.user_id || '',
    prestadorId: booking.prestador_id || '',
    date: booking.booking_date,
    time: booking.start_time || '',
    prestadorName: 'Provider',
    pillar: 'saude_mental' as const,
    status: booking.status as any,
    minutes: 60,
    wasDeducted: booking.status === 'completed',
    payerSource: 'company' as const,
    deductedAt: booking.status === 'completed' ? booking.booking_date : undefined,
    createdAt: booking.booking_date,
    updatedAt: booking.booking_date,
    sessionType: booking.session_type || 'individual' as const,
    meetingPlatform: (booking.meeting_link?.includes('zoom') ? 'zoom' : booking.meeting_link?.includes('teams') ? 'teams' : 'google_meet') as 'zoom' | 'google_meet' | 'teams',
    meetingLink: booking.meeting_link || ''
  }));

  // Separate past and future sessions
  const now = new Date();
  
  const pastSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate < now || session.status === 'completed' || session.status === 'cancelled' || session.status === 'no_show';
  });
  
  const futureSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= now && (session.status === 'scheduled' || session.status === 'confirmed');
  });

  // Get summary stats
  const completedSessionsCount = pastSessions.filter(s => s.status === 'completed').length;
  const futureSessionsCount = futureSessions.length;

  const handleViewDetails = (sessionId: string) => {
    navigate(`/user/sessions`);
  };

  const handleReschedule = (sessionId: string) => {
    navigate('/user/book');
  };

  const handleCancel = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-50">
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto p-6 pb-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Percurso</h1>
            <p className="text-muted-foreground">Acompanhe as suas sessões, objetivos e progresso</p>
          </div>
        </div>

        {/* User Journey Section */}
        <div className="container mx-auto px-6">
        <UserJourneySection
          goals={userGoals}
          balance={sessionBalance}
          completedSessionsCount={completedSessionsCount}
          futureSessionsCount={futureSessionsCount}
          onHistoryClick={() => setIsPastSessionsModalOpen(true)}
          onFutureSessionsClick={() => setIsFutureSessionsModalOpen(true)}
        />
        </div>

        {/* Session Modals */}
        <SessionModal
          isOpen={isPastSessionsModalOpen}
          onClose={() => setIsPastSessionsModalOpen(false)}
          sessions={pastSessions}
          title="Histórico de Sessões Passadas"
          type="past"
          onViewDetails={handleViewDetails}
        />
        <SessionModal
          isOpen={isFutureSessionsModalOpen}
          onClose={() => setIsFutureSessionsModalOpen(false)}
          sessions={futureSessions}
          title="Próximas Sessões Agendadas"
          type="future"
          onViewDetails={handleViewDetails}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}