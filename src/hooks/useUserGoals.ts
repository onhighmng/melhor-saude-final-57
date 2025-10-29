import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserGoal {
  id: string;
  user_id: string;
  pillar: 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica';
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  progress_percentage: number;
  status: 'active' | 'completed' | 'paused';
  source: 'onboarding' | 'manual' | 'system';
  created_at: string;
  completed_at?: string;
  metadata?: any;
}

export function useUserGoals() {
  const { profile } = useAuth();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await Promise.race([
        supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const updateGoalProgress = useCallback(async (goalId: string, newValue: number) => {
    if (!profile?.id) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const progressPercentage = goal.target_value 
        ? Math.min(100, Math.round((newValue / goal.target_value) * 100))
        : 0;

      const status = progressPercentage >= 100 ? 'completed' : 'active';
      const completed_at = progressPercentage >= 100 ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('user_goals')
        .update({ 
          current_value: newValue,
          progress_percentage: progressPercentage,
          status,
          completed_at
        })
        .eq('id', goalId);

      if (error) throw error;

      // Create notification if goal completed
      if (status === 'completed') {
        await supabase.rpc('create_notification', {
          p_user_id: profile.id,
          p_type: 'goal_progress',
          p_title: 'Objetivo Alcançado!',
          p_message: `Parabéns! Completou o objetivo: ${goal.title}`,
          p_action_url: '/user/sessions',
          p_metadata: { goal_id: goalId }
        });
      }

      await loadGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }, [profile?.id, goals, loadGoals]);

  const createGoal = useCallback(async (goalData: Partial<UserGoal>) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: profile.id,
          ...goalData
        });

      if (error) throw error;

      await loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  }, [profile?.id, loadGoals]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    updateGoalProgress,
    createGoal,
    reloadGoals: loadGoals
  };
}

