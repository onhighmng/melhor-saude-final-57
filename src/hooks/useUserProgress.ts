import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressMetrics {
  totalSessions: number;
  chatInteractions: number;
  resourcesViewed: number;
  activeDays: number;
  pillars: string[];
  lastActive: string | null;
}

export const useUserProgress = (userId: string | undefined) => {
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    totalSessions: 0,
    chatInteractions: 0,
    resourcesViewed: 0,
    activeDays: 0,
    pillars: [],
    lastActive: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        if (data && data.length > 0) {
          const sessions = data.filter(p => p.action_type === 'session_completed').length;
          const chats = data.filter(p => p.action_type === 'chat_interaction').length;
          const resources = data.filter(p => p.action_type === 'resource_viewed').length;
          
          const uniqueDays = new Set(data.map(p => 
            new Date(p.action_date).toDateString()
          )).size;
          
          const uniquePillars = [...new Set(data.map(p => p.pillar).filter(Boolean))] as string[];

          const sortedByDate = [...data].sort((a, b) => 
            new Date(b.action_date).getTime() - new Date(a.action_date).getTime()
          );
          const lastActive = sortedByDate.length > 0 ? sortedByDate[0].action_date : null;

          setMetrics({
            totalSessions: sessions,
            chatInteractions: chats,
            resourcesViewed: resources,
            activeDays: uniqueDays,
            pillars: uniquePillars,
            lastActive
          });
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();

    // Real-time subscription for progress updates
    const subscription = supabase
      .channel('user-progress-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchProgress();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { metrics, isLoading };
};
