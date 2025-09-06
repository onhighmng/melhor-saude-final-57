import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  related_id?: string;
  metadata?: any;
  created_at: string;
}

class ActivityService {
  async getUserActivity(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  async getActivityStats(): Promise<{
    totalActivities: number;
    todayActivities: number;
    weekActivities: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalActivities: 0, todayActivities: 0, weekActivities: 0 };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data: allActivities, error: allError } = await supabase
        .from('user_activity_log')
        .select('created_at')
        .eq('user_id', user.id);

      if (allError) throw allError;

      const totalActivities = allActivities?.length || 0;
      
      const todayActivities = allActivities?.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= today;
      }).length || 0;

      const weekActivities = allActivities?.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= weekAgo;
      }).length || 0;

      return { totalActivities, todayActivities, weekActivities };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return { totalActivities: 0, todayActivities: 0, weekActivities: 0 };
    }
  }

  formatActivityDescription(activity: ActivityLog): string {
    switch (activity.activity_type) {
      case 'health_checkin':
        return '✅ Completed daily health check-in';
      case 'session_booked':
        return '📅 Booked a therapy session';
      case 'session_completed':
        return '🎯 Completed therapy session';
      case 'achievement_earned':
        return `🏆 ${activity.activity_description}`;
      case 'profile_updated':
        return '👤 Updated profile information';
      default:
        return activity.activity_description;
    }
  }

  getActivityIcon(activityType: string): string {
    switch (activityType) {
      case 'health_checkin':
        return 'Heart';
      case 'session_booked':
        return 'Calendar';
      case 'session_completed':
        return 'CheckCircle';
      case 'achievement_earned':
        return 'Trophy';
      case 'profile_updated':
        return 'User';
      default:
        return 'Activity';
    }
  }
}

export const activityService = new ActivityService();