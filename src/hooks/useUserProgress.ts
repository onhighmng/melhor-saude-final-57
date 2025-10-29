import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pillar } from '@/integrations/supabase/types-unified';

interface UserProgress {
  pillar: Pillar;
  sessions_completed: number;
  chats_interactions: number;
  resources_viewed: number;
  milestones_achieved: number;
  goals_completed: number;
  total_points: number;
  progress_percentage: number;
}

interface UserGoal {
  id: string;
  goal_type: string;
  target_value: any;
  current_value: any;
  pillar: Pillar | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: number;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  pillar: Pillar;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  achieved: boolean;
  achieved_at: string | null;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const pillars: Pillar[] = ['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'];

  const loadUserProgress = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await Promise.all([
        loadProgressData(),
        loadUserGoals(),
        loadMilestones()
      ]);
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadProgressData = async () => {
    if (!user?.id) return;

    const progressData: UserProgress[] = [];

    for (const pillar of pillars) {
      // Get sessions completed
      const { count: sessionsCompleted } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('pillar', pillar)
        .eq('status', 'completed');

      // Get chat interactions
      const { count: chatInteractions } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('pillar', pillar)
        .eq('action_type', 'chat_interaction');

      // Get resources viewed
      const { count: resourcesViewed } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('pillar', pillar)
        .eq('action_type', 'resource_viewed');

      // Get milestones achieved
      const { count: milestonesAchieved } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('pillar', pillar)
        .eq('action_type', 'milestone_achieved');

      // Calculate total points (weighted)
      const totalPoints = 
        (sessionsCompleted || 0) * 10 + // Sessions worth 10 points each
        (chatInteractions || 0) * 2 +   // Chat interactions worth 2 points each
        (resourcesViewed || 0) * 1 +    // Resources worth 1 point each
        (milestonesAchieved || 0) * 5;  // Milestones worth 5 points each

      // Calculate progress percentage (max 100 points per pillar)
      const progressPercentage = Math.min((totalPoints / 100) * 100, 100);

      progressData.push({
        pillar,
        sessions_completed: sessionsCompleted || 0,
        chats_interactions: chatInteractions || 0,
        resources_viewed: resourcesViewed || 0,
        milestones_achieved: milestonesAchieved || 0,
        goals_completed: 0, // Will be calculated from goals
        total_points: totalPoints,
        progress_percentage: progressPercentage
      });
    }

    setProgress(progressData);
  };

  const loadUserGoals = async () => {
    // user_goals table does not exist in database
    console.warn('[useUserProgress] user_goals table not implemented');
    setGoals([]);
    
    // Set goals_completed to 0 for all pillars
    setProgress(prev => prev.map(p => ({
      ...p,
      goals_completed: 0
    })));
  };

  const loadMilestones = async () => {
    if (!user?.id) return;

    // Define milestone definitions
    const milestoneDefinitions: Milestone[] = [
      {
        id: 'first_session',
        pillar: 'saude_mental',
        title: 'Primeira Sessão',
        description: 'Complete sua primeira sessão de bem-estar',
        target_value: 1,
        current_value: 0,
        achieved: false,
        achieved_at: null
      },
      {
        id: 'three_sessions',
        pillar: 'saude_mental',
        title: 'Três Sessões',
        description: 'Complete três sessões em qualquer pilar',
        target_value: 3,
        current_value: 0,
        achieved: false,
        achieved_at: null
      },
      {
        id: 'five_sessions',
        pillar: 'bem_estar_fisico',
        title: 'Cinco Sessões',
        description: 'Complete cinco sessões em qualquer pilar',
        target_value: 5,
        current_value: 0,
        achieved: false,
        achieved_at: null
      },
      {
        id: 'ten_sessions',
        pillar: 'assistencia_financeira',
        title: 'Dez Sessões',
        description: 'Complete dez sessões em qualquer pilar',
        target_value: 10,
        current_value: 0,
        achieved: false,
        achieved_at: null
      },
      {
        id: 'all_pillars',
        pillar: 'assistencia_juridica',
        title: 'Todos os Pilares',
        description: 'Complete pelo menos uma sessão em cada pilar',
        target_value: 4,
        current_value: 0,
        achieved: false,
        achieved_at: null
      }
    ];

    // Calculate current values
    const totalSessions = progress.reduce((sum, p) => sum + p.sessions_completed, 0);
    const pillarsWithSessions = progress.filter(p => p.sessions_completed > 0).length;

    const updatedMilestones = milestoneDefinitions.map(milestone => {
      let currentValue = 0;
      
      switch (milestone.id) {
        case 'first_session':
        case 'three_sessions':
        case 'five_sessions':
        case 'ten_sessions':
          currentValue = totalSessions;
          break;
        case 'all_pillars':
          currentValue = pillarsWithSessions;
          break;
      }

      const achieved = currentValue >= milestone.target_value;
      
      return {
        ...milestone,
        current_value: currentValue,
        achieved,
        achieved_at: achieved ? new Date().toISOString() : null
      };
    });

    setMilestones(updatedMilestones);
  };

  const trackProgress = async (
    actionType: 'session_completed' | 'chat_interaction' | 'resource_viewed' | 'milestone_achieved',
    pillar: Pillar,
    metadata: any = {}
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
          .from('user_progress')
        .insert({
          user_id: user.id,
          pillar,
          action_type: actionType,
          metadata
        });

        if (error) throw error;

      // Reload progress data
      await loadUserProgress();
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<UserGoal>) => {
    console.warn('[useUserProgress] user_goals table not implemented');
  };

  const createGoal = async (goalData: Omit<UserGoal, 'id' | 'created_at' | 'updated_at'>) => {
    console.warn('[useUserProgress] user_goals table not implemented');
  };

  const getPillarProgress = (pillar: Pillar): UserProgress | undefined => {
    return progress.find(p => p.pillar === pillar);
  };

  const getOverallProgress = (): number => {
    if (progress.length === 0) return 0;
    const totalProgress = progress.reduce((sum, p) => sum + p.progress_percentage, 0);
    return totalProgress / progress.length;
  };

  const getAchievedMilestones = (): Milestone[] => {
    return milestones.filter(m => m.achieved);
  };

  const getPendingMilestones = (): Milestone[] => {
    return milestones.filter(m => !m.achieved);
  };

  const getGoalsByPillar = (pillar: Pillar): UserGoal[] => {
    return goals.filter(g => g.pillar === pillar);
  };

  const getActiveGoals = (): UserGoal[] => {
    return goals.filter(g => g.status === 'active');
  };

  const getCompletedGoals = (): UserGoal[] => {
    return goals.filter(g => g.status === 'completed');
  };

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  useEffect(() => {
    setOverallProgress(getOverallProgress());
  }, [progress]);

  return {
    loading,
    progress,
    goals,
    milestones,
    overallProgress,
    trackProgress,
    updateGoal,
    createGoal,
    getPillarProgress,
    getOverallProgress,
    getAchievedMilestones,
    getPendingMilestones,
    getGoalsByPillar,
    getActiveGoals,
    getCompletedGoals,
    refreshProgress: loadUserProgress
  };
};