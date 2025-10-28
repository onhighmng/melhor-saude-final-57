import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionModal } from "@/components/sessions/SessionModal";
import { SessionRatingDialog } from "@/components/sessions/SessionRatingDialog";
import UserJourneySection from "@/components/ui/user-journey-section";
import { useBookings } from "@/hooks/useBookings";
import { useSessionBalance } from "@/hooks/useSessionBalance";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emailService } from '@/services/emailService';
import { CANCELLATION_POLICY_HOURS } from "@/config/constants";
import { useToast } from '@/hooks/use-toast';

export default function UserSessions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { allBookings, upcomingBookings, refetch, loading: bookingsLoading } = useBookings();
  const { sessionBalance, loading: balanceLoading, refetch: refetchBalance } = useSessionBalance();
  const toastHook = useToast();
  interface UserGoal {
    id: string;
    title: string;
    pillar: string;
    targetSessions: number;
    completedSessions: number;
    progressPercentage: number;
    progressEmojis: string[];
  }
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [isPastSessionsModalOpen, setIsPastSessionsModalOpen] = useState(false);
  const [isFutureSessionsModalOpen, setIsFutureSessionsModalOpen] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<string | null>(null);
  
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
    user_id: booking.user_id,
    prestador_id: booking.prestador_id,
    booking_date: booking.booking_date,
    date: booking.booking_date,
    time: booking.start_time || '',
    prestadorName: booking.provider_name || 'Provider',
    pillar: (booking.pillar || 'saude_mental') as 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica',
    status: booking.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
    minutes: 60,
    wasDeducted: booking.status === 'completed',
    payerSource: 'company' as const,
    deductedAt: booking.status === 'completed' ? booking.booking_date : undefined,
    createdAt: booking.booking_date,
    updatedAt: booking.booking_date,
    session_type: 'individual' as const,
    sessionType: 'individual' as const,
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
    // Store booking ID in sessionStorage for booking flow
    sessionStorage.setItem('reschedule_booking_id', sessionId);
    navigate('/user/book?mode=reschedule');
  };

  const handleRateSession = (sessionId: string) => {
    setSelectedSessionForRating(sessionId);
    setShowRatingDialog(true);
  };

  const handleCancel = async (sessionId: string) => {
    try {
      // Get booking details for notification
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          prestadores!bookings_prestador_id_fkey (name, email, user_id)
        `)
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      // Check if booking is within 24 hours
      const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
      const now = new Date();
      const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < CANCELLATION_POLICY_HOURS) {
        toastHook.toast({
          title: 'Atenção',
          description: 'Cancelamentos com menos de 24h de antecedência podem afetar a sua quota.',
          variant: 'destructive'
        });
      }

      // Use atomic RPC function to cancel booking
      const { data: cancelResult, error: cancelError } = await supabase.rpc('cancel_booking_with_refund', {
        _booking_id: sessionId,
        _user_id: profile.id,
        _company_id: booking.company_id,
        _cancellation_reason: 'user_requested',
        _refund_quota: hoursUntil >= CANCELLATION_POLICY_HOURS
      });

      if (cancelError) throw cancelError;

      // Create notification for provider
      const prestadorUserId = booking.prestadores?.user_id || booking.prestador_id;
      await supabase.from('notifications').insert({
        user_id: prestadorUserId,
        type: 'booking_cancelled',
        title: 'Sessão Cancelada',
        message: `A sessão de ${booking.date} às ${booking.start_time} foi cancelada pelo utilizador.`,
        related_booking_id: sessionId,
        priority: 'high'
      });

      // Send cancellation email to user
      try {
        const { data: providerData } = await supabase
          .from('prestadores')
          .select('name, email')
          .eq('id', booking.prestador_id)
          .single();
          
        if (providerData?.name && profile?.email) {
          await emailService.sendBookingCancellation(profile.email, {
            userName: profile.name,
            providerName: providerData.name,
            date: booking.date,
            time: booking.start_time,
            pillar: booking.pillar
          });
        }
      } catch (emailError) {
        // Don't block cancellation on email failure
      }

      const resultData = cancelResult as { success?: boolean; refunded?: boolean; error?: string } | null;
      
      toastHook.toast({
        title: 'Sessão cancelada',
        description: resultData?.refunded 
          ? 'A sua sessão foi cancelada e a quota foi reembolsada.'
          : 'Sessão cancelada. Quota não reembolsada devido à política de cancelamento (< 24h).'
      });

      // Refresh bookings list
      refetch();
      refetchBalance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao cancelar sessão';
      toastHook.toast({
        title: 'Erro ao cancelar sessão',
        description: errorMessage,
        variant: 'destructive'
      });
    }
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
            balance={{
              userId: profile?.id || '',
              companyQuota: sessionBalance?.employerRemaining || 0,
              personalQuota: sessionBalance?.personalRemaining || 0,
              usedCompany: 0,
              usedPersonal: 0,
              availableCompany: sessionBalance?.employerRemaining || 0,
              availablePersonal: sessionBalance?.personalRemaining || 0
            }}
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
          onRate={handleRateSession}
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

        {/* Rating Dialog */}
        {selectedSessionForRating && (
          <SessionRatingDialog
            open={showRatingDialog}
            onOpenChange={setShowRatingDialog}
            sessionId={selectedSessionForRating}
            pillarName={sessions.find(s => s.id === selectedSessionForRating)?.pillar || ''}
          />
        )}
      </div>
    </div>
  );
}