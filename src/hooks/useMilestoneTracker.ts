import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface MilestoneUpdate {
  id: string;
  milestone_type: string;
  label: string;
  points: number;
  completed: boolean;
}

/**
 * Hook to track milestone completions in real-time
 * Subscribes to user_milestones table changes and triggers celebrations
 */
export const useMilestoneTracker = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const previousMilestones = useRef<Set<string>>(new Set());
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);

  const triggerCelebration = (milestone: MilestoneUpdate) => {
    // Show confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Show toast notification
    toast({
      title: '🎉 Marco Alcançado!',
      description: `Parabéns! ${milestone.label} (+${milestone.points}%)`,
      duration: 5000,
    });

    // Set celebrating state for UI animations
    setCelebratingMilestone(milestone.milestone_type);
    setTimeout(() => {
      setCelebratingMilestone(null);
    }, 3000);
  };

  useEffect(() => {
    if (!profile?.id) return;

    // Load initial milestones to track which ones are already completed
    const loadInitialMilestones = async () => {
      const { data: milestones } = await supabase
        .from('user_milestones')
        .select('milestone_type, completed')
        .eq('user_id', profile.id)
        .eq('completed', true);

      if (milestones) {
        milestones.forEach(m => {
          previousMilestones.current.add(m.milestone_type);
        });
      }
    };

    loadInitialMilestones();

    // Subscribe to milestone changes
    const channel = supabase
      .channel('milestone-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_milestones',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          const milestone = payload.new as MilestoneUpdate;
          
          // Only celebrate if milestone was just completed
          if (
            milestone.completed && 
            !previousMilestones.current.has(milestone.milestone_type)
          ) {
            previousMilestones.current.add(milestone.milestone_type);
            triggerCelebration(milestone);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, toast]);

  return {
    celebratingMilestone,
  };
};


