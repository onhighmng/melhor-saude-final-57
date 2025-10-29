import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Milestone {
  id: string;
  user_id: string;
  milestone_type: string;
  label: string;
  points: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  metadata?: any;
}

export function useMilestones() {
  const { profile } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const loadMilestones = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if user has milestones, if not initialize them
      const { data: existing, error: checkError } = await Promise.race([
        supabase
          .from('user_milestones')
          .select('*')
          .eq('user_id', profile.id),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);

      if (checkError) throw checkError;

      // Initialize milestones if none exist
      if (!existing || existing.length === 0) {
        await supabase.rpc('initialize_user_milestones', {
          p_user_id: profile.id
        });

        // Reload after initialization
        const { data: newMilestones } = await supabase
          .from('user_milestones')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: true });

        setMilestones(newMilestones || []);
      } else {
        setMilestones(existing);
      }

      // Calculate progress
      if (existing && existing.length > 0) {
        const totalPoints = existing.reduce((sum, m) => sum + m.points, 0);
        const earnedPoints = existing
          .filter(m => m.completed)
          .reduce((sum, m) => sum + m.points, 0);
        setProgress(totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      setMilestones([]);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const completeMilestone = useCallback(async (milestoneType: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('user_milestones')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('user_id', profile.id)
        .eq('milestone_type', milestoneType);

      if (error) throw error;

      // Reload milestones
      await loadMilestones();

      // Create notification
      const milestone = milestones.find(m => m.milestone_type === milestoneType);
      if (milestone) {
        await supabase.rpc('create_notification', {
          p_user_id: profile.id,
          p_type: 'milestone_achieved',
          p_title: 'Marco Alcançado!',
          p_message: `Parabéns! Completou: ${milestone.label}`,
          p_action_url: '/user/dashboard',
          p_metadata: { milestone_type: milestoneType, points: milestone.points }
        });
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  }, [profile?.id, milestones, loadMilestones]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  return {
    milestones,
    loading,
    progress,
    completeMilestone,
    reloadMilestones: loadMilestones
  };
}

