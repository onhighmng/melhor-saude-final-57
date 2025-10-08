import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserMilestones {
  // Session milestones
  firstSessionComplete: boolean;
  threeSessionsComplete: boolean;
  sessionCount: number;
  sessionProgress: number; // 0-100
  
  // Feedback milestones
  firstFeedbackGiven: boolean;
  feedbackImprovement: boolean;
  feedbackProgress: number; // 0-100
}

export const useUserMilestones = (userId: string | undefined) => {
  const [milestones, setMilestones] = useState<UserMilestones>({
    firstSessionComplete: false,
    threeSessionsComplete: false,
    sessionCount: 0,
    sessionProgress: 0,
    firstFeedbackGiven: false,
    feedbackImprovement: false,
    feedbackProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchMilestones = async () => {
      try {
        // 1. Get session count
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('action_type', 'session_completed');

        const sessionCount = progressData?.length || 0;

        // 2. Get chat satisfaction ratings (ordered by date)
        const { data: chatSatisfaction } = await supabase
          .from('chat_sessions')
          .select('satisfaction_rating, created_at')
          .eq('user_id', userId)
          .not('satisfaction_rating', 'is', null)
          .order('created_at', { ascending: false });

        // 3. Get session feedback ratings
        const { data: sessionFeedback } = await supabase
          .from('feedback')
          .select('rating, created_at')
          .eq('user_id', userId)
          .not('rating', 'is', null)
          .order('created_at', { ascending: false });

        // Combine and convert all feedback to numeric scale
        const allRatings = [
          ...(chatSatisfaction || []).map(cs => ({
            rating: cs.satisfaction_rating === 'satisfied' ? 5 : 1,
            created_at: cs.created_at
          })),
          ...(sessionFeedback || []).map(sf => ({
            rating: sf.rating,
            created_at: sf.created_at
          }))
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const firstFeedbackGiven = allRatings.length > 0;
        const feedbackImprovement = allRatings.length >= 2 
          ? allRatings[0].rating > allRatings[1].rating
          : false;

        // Calculate progress percentages
        const sessionProgress = Math.min((sessionCount / 3) * 100, 100);
        const feedbackMilestonesComplete = 
          (firstFeedbackGiven ? 1 : 0) + (feedbackImprovement ? 1 : 0);
        const feedbackProgress = (feedbackMilestonesComplete / 2) * 100;

        setMilestones({
          firstSessionComplete: sessionCount >= 1,
          threeSessionsComplete: sessionCount >= 3,
          sessionCount,
          sessionProgress,
          firstFeedbackGiven,
          feedbackImprovement,
          feedbackProgress,
        });
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [userId]);

  return { milestones, isLoading };
};
