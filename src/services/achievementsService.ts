import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description?: string;
  earned_at: string;
  icon_name?: string;
  is_milestone: boolean;
}

class AchievementsService {
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  async getRecentAchievements(limit: number = 3): Promise<Achievement[]> {
    try {
      const achievements = await this.getUserAchievements();
      return achievements.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent achievements:', error);
      return [];
    }
  }

  async getAchievementStats(): Promise<{
    totalAchievements: number;
    milestones: number;
    latestAchievement?: Achievement;
  }> {
    try {
      const achievements = await this.getUserAchievements();
      
      return {
        totalAchievements: achievements.length,
        milestones: achievements.filter(a => a.is_milestone).length,
        latestAchievement: achievements[0]
      };
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      return { totalAchievements: 0, milestones: 0 };
    }
  }
}

export const achievementsService = new AchievementsService();