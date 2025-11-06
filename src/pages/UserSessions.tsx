import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionModal } from "@/components/sessions/SessionModal";
import { SessionRatingDialog } from "@/components/sessions/SessionRatingDialog";
import UserJourneySection from "@/components/ui/user-journey-section";
import { useBookings } from "@/hooks/useBookings";
import { useSessionBalance } from "@/hooks/useSessionBalance";
import { useUserGoals } from "@/hooks/useUserGoals";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emailService } from '@/services/emailService';
import { CANCELLATION_POLICY_HOURS } from "@/config/constants";
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserSessions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { allBookings, upcomingBookings, refetch, loading: bookingsLoading } = useBookings();
  const { sessionBalance, loading: balanceLoading, refetch: refetchBalance } = useSessionBalance();
  const { goals: userGoalsData, loading: goalsLoading } = useUserGoals();
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
  
  // Transform user goals from database to display format
  useEffect(() => {
    if (!userGoalsData || userGoalsData.length === 0) return;
    
    const completedCount = allBookings.filter(b => b.status === 'completed').length;
    
    const transformed = userGoalsData
      .filter(goal => goal.status === 'active')
      .slice(0, 4) // Only show top 4 goals for animation cards
      .map(goal => ({
        id: goal.id,
        title: goal.title,
        pillar: goal.pillar,
        targetSessions: goal.target_value || 5,
        completedSessions: goal.current_value || 0,
        progressPercentage: goal.progress_percentage,
        progressEmojis: getProgressEmojis(goal.progress_percentage)
      }));
    
    setUserGoals(transformed);
  }, [userGoalsData, allBookings]);
  
  // Auto-trigger rating dialog for recently completed, unrated sessions
  useEffect(() => {
    if (!allBookings || allBookings.length === 0) return;
    
    // Find recently completed sessions without rating (within last 24 hours)
    const now = new Date().getTime();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const unratedSessions = allBookings.filter(booking => {
      const bookingTime = new Date(booking.date).getTime();
      return (
        booking.status === 'completed' &&
        !booking.rating &&
        bookingTime >= oneDayAgo &&
        bookingTime <= now
      );
    });
    
    // Trigger rating dialog for the most recent unrated session
    if (unratedSessions.length > 0 && !selectedSessionForRating) {
      const mostRecent = unratedSessions[0];
      setSelectedSessionForRating(mostRecent.id);
      setShowRatingDialog(true);
    }
  }, [allBookings, selectedSessionForRating]);
  
  // Generate progress emojis based on percentage
  const getProgressEmojis = (percentage: number): string[] => {
    if (percentage < 33) return ['😟', '🙂', '😄'];
    if (percentage < 66) return ['✅', '🙂', '😄'];
    return ['✅', '✅', '😄'];
  };
  
  // Convert bookings to sessions format
  const sessions = allBookings.map(booking => ({
    id: booking.id,
    user_id: booking.user_id,
    prestador_id: booking.prestador_id,
    date: booking.date,
    time: booking.start_time || '',
    prestadorName: booking.provider_name || 'Provider',
    pillar: (booking.pillar || 'saude_mental') as 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica',
    status: booking.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
    minutes: 60,
    wasDeducted: booking.status === 'completed',
    payerSource: 'company' as const,
    deductedAt: booking.status === 'completed' ? booking.date : undefined,
    createdAt: booking.date,
    updatedAt: booking.date,
    session_type: 'individual' as const,
    sessionType: 'individual' as const,
    meetingPlatform: (booking.meeting_link?.includes('zoom') ? 'zoom' : booking.meeting_link?.includes('teams') ? 'teams' : 'google_meet') as 'zoom' | 'google_meet' | 'teams',
    meetingLink: booking.meeting_link || '',
    rating: booking.rating || undefined
  }));

  // Separate past and future sessions
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for date-only comparison
  
  const pastSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate < now || session.status === 'completed' || session.status === 'cancelled' || session.status === 'no_show';
  });
  
  const futureSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= now && (session.status === 'scheduled' || session.status === 'confirmed');
  });

  // Get summary stats
  const completedSessionsCount = pastSessions.filter(s => s.status === 'completed').length;
  const futureSessionsCount = futureSessions.length;

  // Auto-trigger rating dialog for recently completed, unrated sessions
  useEffect(() => {
    if (bookingsLoading || !sessions.length) return;
    
    const now = new Date().getTime();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Find unrated completed sessions from last 24 hours
    const unratedSessions = sessions.filter(s => {
      if (s.status !== 'completed' || s.rating) return false;
      
      const sessionTime = new Date(s.date).getTime();
      return sessionTime > oneDayAgo && sessionTime < now;
    });
    
    // Auto-open dialog for first unrated session
    if (unratedSessions.length > 0 && !selectedSessionForRating) {
      setSelectedSessionForRating(unratedSessions[0].id);
      setShowRatingDialog(true);
    }
  }, [sessions, bookingsLoading, selectedSessionForRating]);

  // Note: Always show journey data even if user has no bookings yet

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
          prestadores!bookings_prestador_id_fkey (
            name,
            user_id,
            profiles!prestadores_user_id_fkey (email, phone)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      // Check if booking is within 24 hours
      const bookingDate = (booking as any).date || (booking as any).booking_date;
      const bookingDateTime = new Date(`${bookingDate}T${(booking as any).start_time}`);
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
      const prestadorUserId = (booking as any).prestadores?.user_id || (booking as any).prestador_id;
      const notificationDate = (booking as any).date || (booking as any).booking_date;
      await supabase.from('notifications').insert({
        user_id: prestadorUserId,
        type: 'booking_cancelled',
        title: 'Sessão Cancelada',
        message: `A sessão de ${notificationDate} às ${(booking as any).start_time} foi cancelada pelo utilizador.`,
        related_booking_id: sessionId,
        priority: 'high'
      });

      // Send cancellation email to user
      try {
        // Send cancellation email (method not implemented)
        // const { data: providerData } = await supabase
        //   .from('prestadores')
        //   .select('name, email')
        //   .eq('id', booking.prestador_id)
        //   .single();
        //   
        // if (providerData?.name && profile?.email) {
        //   await emailService.sendBookingCancellation(profile.email, {
        //     userName: profile.full_name,
        //     providerName: providerData.name,
        //     date: booking.date,
        //     time: booking.start_time,
        //     pillar: booking.pillar
        //   });
        // }
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
    <div className="w-full min-h-screen bg-blue-50">
      {/* Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meu Percurso</h1>
              <p className="text-muted-foreground">Acompanhe as suas sessões, objetivos e progresso</p>
            </div>
          </div>
        </div>

        {/* Welcome message for new users with no bookings */}
        {!bookingsLoading && allBookings.length === 0 && (
          <div className="container mx-auto px-6 mb-6 mt-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-md">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao seu Percurso de Bem-Estar!</h2>
              <p className="text-muted-foreground mb-6">
                Comece a sua jornada agendando a primeira sessão. Acompanhe os seus objetivos, progresso e conquiste marcos importantes.
              </p>
              <Button onClick={() => navigate('/user/book')} size="lg">
                Agendar Primeira Sessão
              </Button>
            </div>
          </div>
        )}

        {/* User Journey Section */}
        <div className="container mx-auto px-6">
          <UserJourneySection
            goals={userGoals}
            balance={{
              userId: profile?.id || '',
              companyQuota: sessionBalance?.companyQuota || 0,
              personalQuota: sessionBalance?.personalQuota || 0,
              usedCompany: sessionBalance?.usedCompany || 0,
              usedPersonal: sessionBalance?.usedPersonal || 0,
              availableCompany: sessionBalance?.availableCompany || 0,
              availablePersonal: sessionBalance?.availablePersonal || 0
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