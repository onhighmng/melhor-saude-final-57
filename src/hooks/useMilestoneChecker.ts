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
        const completeMilestone = async (milestoneId: string) => {
          const milestone = milestones.find(m => m.milestone_id === milestoneId);
          if (!milestone || milestone.completed) return;

          await supabase
            .from('user_milestones')
            .update({
              completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('milestone_id', milestoneId);

          // Track in user_progress
          await supabase.from('user_progress').insert({
            user_id: user.id,
            action_type: 'milestone_achieved',
            action_date: new Date().toISOString(),
            metadata: { milestone_id: milestoneId }
          });

          // Trigger event for UI update
          window.dispatchEvent(new CustomEvent('milestoneCompleted'));
        };

        // Check 'specialist' milestone - has spoken to specialist via phone
        const specialistMilestone = milestones.find(m => m.milestone_id === 'specialist');
        if (specialistMilestone && !specialistMilestone.completed) {
          const { data: chats } = await supabase
            .from('chat_sessions')
            .select('phone_contact_made')
            .eq('user_id', user.id)
            .eq('phone_contact_made', true)
            .limit(1);

          if (chats && chats.length > 0) {
            await completeMilestone('specialist');
          }
        }

        // Check 'first_session' milestone - completed first session
        const firstSessionMilestone = milestones.find(m => m.milestone_id === 'first_session');
        if (firstSessionMilestone && !firstSessionMilestone.completed) {
          const { data: sessions } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('action_type', 'session_completed')
            .limit(1);

          if (sessions && sessions.length > 0) {
            await completeMilestone('first_session');
          }
        }

        // Check 'resources' milestone - viewed first resource
        const resourcesMilestone = milestones.find(m => m.milestone_id === 'resources');
        if (resourcesMilestone && !resourcesMilestone.completed) {
          const { data: resources } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('action_type', 'resource_viewed')
            .limit(1);

          if (resources && resources.length > 0) {
            await completeMilestone('resources');
          }
        }

        // Check 'ratings' milestone - gave 3 ratings
        const ratingsMilestone = milestones.find(m => m.milestone_id === 'ratings');
        if (ratingsMilestone && !ratingsMilestone.completed) {
          const { count } = await supabase
            .from('feedback')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (count && count >= 3) {
            await completeMilestone('ratings');
          }
        }
      } catch (error) {
        // Silent fail for milestone checking
      }
    };

    // Check on mount
    checkMilestones();

    // Subscribe to user_progress changes
    const progressChannel = supabase
      .channel('milestone-checker-progress')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${user.id}`
      }, () => {
        checkMilestones();
      })
      .subscribe();

    // Subscribe to feedback changes
    const feedbackChannel = supabase
      .channel('milestone-checker-feedback')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `user_id=eq.${user.id}`
      }, () => {
        checkMilestones();
      })
      .subscribe();

    // Subscribe to chat_sessions changes
    const chatChannel = supabase
      .channel('milestone-checker-chat')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        checkMilestones();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [user?.id]);
};
