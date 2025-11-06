import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to auto-complete sessions after their end time
 * Checks for confirmed bookings that have passed their end time
 * and marks them as completed, tracking user progress
 */
export const useSessionCompletion = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user?.id || !profile?.id) return;

    const checkCompletions = async () => {
      try {
        const now = new Date();
        
        // Find bookings that ended but still marked as 'confirmed' or 'pending_confirmation'
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['confirmed', 'pending_confirmation'])
          .lte('date', now.toISOString().split('T')[0]);

        if (error) throw error;

        if (bookings && bookings.length > 0) {
          for (const booking of bookings) {
            // Check if session has ended
            const sessionDate = new Date(booking.date);
            const [hours, minutes] = (booking.end_time || '23:59').split(':');
            const endDateTime = new Date(sessionDate);
            endDateTime.setHours(parseInt(hours), parseInt(minutes));

            // If session has ended, mark as completed
            if (endDateTime < now) {
              // Mark as completed
              await supabase
                .from('bookings')
                .update({
                  status: 'completed',
                  completed_at: endDateTime.toISOString()
                })
                .eq('id', booking.id);

              // Insert user_progress
              await supabase.from('user_progress').insert({
                user_id: user.id,
                pillar: booking.pillar,
                action_type: 'session_completed',
                action_date: endDateTime.toISOString(),
                metadata: {
                  booking_id: booking.id,
                  prestador_id: booking.prestador_id
                }
              });

              // Create notification for user
              await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'session_completed',
                title: 'Sessão Concluída',
                message: 'A sua sessão foi marcada como concluída. Pode agora deixar feedback.',
                related_booking_id: booking.id,
                priority: 'normal'
              });
            }
          }
        }
      } catch (error) {
        // Silent fail for session completion checking
      }
    };

    // Check on mount and every 5 minutes
    checkCompletions();
    const interval = setInterval(checkCompletions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id, profile?.id]);
};

