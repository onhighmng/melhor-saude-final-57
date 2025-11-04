import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-checks and completes user milestones based on their activity
 * Listens to user_progress and feedback tables for real-time updates
 */
export const useMilestoneChecker = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const checkMilestones = async () => {
      try {
        // Get current milestones
        const { data: milestones, error: milestonesError } = await supabase
          .from('user_milestones')
          .select('*')
          .eq('user_id', user.id);

        if (milestonesError) throw milestonesError;
        if (!milestones) return;

        // Helper to complete a milestone
        const completeMilestone = async (milestoneType: string) => {
          const milestone = milestones.find(m => m.milestone_type === milestoneType);
          if (!milestone || milestone.completed) return;

          await supabase
            .from('user_milestones')
            .update({
              completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('milestone_type', milestoneType);

          // Track in user_progress
          await supabase.from('user_progress').insert({
            user_id: user.id,
            action_type: 'milestone_achieved',
            action_date: new Date().toISOString(),
            metadata: { milestone_type: milestoneType }
          });

          // Trigger event for UI update
          window.dispatchEvent(new CustomEvent('milestoneCompleted'));
        };

        // Check 'booking_confirmed' milestone - first booking scheduled
        const bookingMilestone = milestones.find(m => m.milestone_type === 'booking_confirmed');
        if (bookingMilestone && !bookingMilestone.completed) {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (bookings && bookings.length > 0) {
            await completeMilestone('booking_confirmed');
          }
        }

        // Check 'first_session' milestone - completed first session
        const firstSessionMilestone = milestones.find(m => m.milestone_type === 'first_session');
        if (firstSessionMilestone && !firstSessionMilestone.completed) {
          const { data: sessions } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .limit(1);

          if (sessions && sessions.length > 0) {
            await completeMilestone('first_session');
          }
        }

        // Check 'complete_profile' milestone - profile has name, phone, and avatar
        const profileMilestone = milestones.find(m => m.milestone_type === 'complete_profile');
        if (profileMilestone && !profileMilestone.completed) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, phone, avatar_url')
            .eq('id', user.id)
            .single();

          if (profile && profile.name && profile.phone && profile.avatar_url) {
            await completeMilestone('complete_profile');
          }
        }

        // Check 'fifth_session' milestone - completed 5 sessions
        const fifthSessionMilestone = milestones.find(m => m.milestone_type === 'fifth_session');
        if (fifthSessionMilestone && !fifthSessionMilestone.completed) {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed');

          if (count && count >= 5) {
            await completeMilestone('fifth_session');
          }
        }
      } catch (error) {
        // Silent fail for milestone checking
      }
    };

    // Check on mount
    checkMilestones();

    // Subscribe to bookings changes (for booking_confirmed, first_session, and fifth_session milestones)
    const bookingsChannel = supabase
      .channel('milestone-checker-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, () => {
        checkMilestones();
      })
      .subscribe();

    // Subscribe to profiles changes (for complete_profile milestone)
    const profilesChannel = supabase
      .channel('milestone-checker-profiles')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, () => {
        checkMilestones();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user?.id]);
};
