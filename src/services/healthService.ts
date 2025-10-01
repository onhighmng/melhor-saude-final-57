import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckin {
  id: string;
  user_id: string;
  mood_rating: number;
  energy_level: number;
  stress_level: number;
  sleep_quality: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthCheckinData {
  mood_rating: number;
  energy_level: number;
  stress_level: number;
  sleep_quality: number;
  notes?: string;
}

class HealthService {
  async createHealthCheckin(data: CreateHealthCheckinData): Promise<HealthCheckin | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: checkin, error } = await supabase
        .from('health_checkins')
        .insert({
          user_id: user.id,
          ...data
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_activity_type: 'health_checkin',
        p_activity_description: 'Completed daily health check-in',
        p_related_id: checkin.id,
        p_metadata: {
          mood_rating: data.mood_rating,
          energy_level: data.energy_level,
          stress_level: data.stress_level,
          sleep_quality: data.sleep_quality
        }
      });

      // Check for achievements
      await this.checkHealthAchievements(user.id);

      return checkin;
    } catch (error) {
      console.error('Error creating health check-in:', error);
      return null;
    }
  }

  async getLatestHealthCheckin(): Promise<HealthCheckin | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('health_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching latest health check-in:', error);
      return null;
    }
  }

  async getHealthHistory(limit: number = 7): Promise<HealthCheckin[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('health_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching health history:', error);
      return [];
    }
  }

  async getHealthStats(): Promise<{
    totalCheckins: number;
    averageMood: number;
    streakDays: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalCheckins: 0, averageMood: 0, streakDays: 0 };

      const { data: checkins, error } = await supabase
        .from('health_checkins')
        .select('mood_rating, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalCheckins = checkins?.length || 0;
      const averageMood = checkins?.length 
        ? checkins.reduce((sum, c) => sum + c.mood_rating, 0) / checkins.length
        : 0;

      // Calculate streak (consecutive days with check-ins)
      let streakDays = 0;
      if (checkins && checkins.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < checkins.length; i++) {
          const checkinDate = new Date(checkins[i].created_at);
          checkinDate.setHours(0, 0, 0, 0);
          
          const expectedDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
          
          if (checkinDate.getTime() === expectedDate.getTime()) {
            streakDays++;
          } else {
            break;
          }
        }
      }

      return { totalCheckins, averageMood, streakDays };
    } catch (error) {
      console.error('Error fetching health stats:', error);
      return { totalCheckins: 0, averageMood: 0, streakDays: 0 };
    }
  }

  private async checkHealthAchievements(userId: string) {
    try {
      const stats = await this.getHealthStats();
      
      // First check-in achievement
      if (stats.totalCheckins === 1) {
        await supabase.rpc('award_achievement', {
          p_user_id: userId,
          p_achievement_type: 'first_checkin',
          p_achievement_title: 'Health Journey Started',
          p_achievement_description: 'Completed your first health check-in',
          p_icon_name: 'Heart',
          p_is_milestone: true
        });
      }

      // Streak achievements
      if (stats.streakDays === 7) {
        await supabase.rpc('award_achievement', {
          p_user_id: userId,
          p_achievement_type: 'week_streak',
          p_achievement_title: 'Week Warrior',
          p_achievement_description: '7 consecutive days of health check-ins',
          p_icon_name: 'Calendar',
          p_is_milestone: true
        });
      }

      if (stats.streakDays === 30) {
        await supabase.rpc('award_achievement', {
          p_user_id: userId,
          p_achievement_type: 'month_streak',
          p_achievement_title: 'Monthly Master',
          p_achievement_description: '30 consecutive days of health check-ins',
          p_icon_name: 'Trophy',
          p_is_milestone: true
        });
      }

      // Total check-ins achievements
      if (stats.totalCheckins === 10) {
        await supabase.rpc('award_achievement', {
          p_user_id: userId,
          p_achievement_type: 'ten_checkins',
          p_achievement_title: 'Consistent Tracker',
          p_achievement_description: 'Completed 10 health check-ins',
          p_icon_name: 'Target'
        });
      }
    } catch (error) {
      console.error('Error checking health achievements:', error);
    }
  }
}

export const healthService = new HealthService();