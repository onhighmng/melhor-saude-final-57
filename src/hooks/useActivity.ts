import { useState, useEffect } from 'react';
import { activityService, ActivityLog } from '@/services/activityService';

export const useActivity = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    weekActivities: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const [activityList, stats] = await Promise.all([
        activityService.getUserActivity(10),
        activityService.getActivityStats()
      ]);
      
      setActivities(activityList);
      setActivityStats(stats);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return {
    activities,
    activityStats,
    loading,
    refetch: fetchActivity,
    formatActivityDescription: activityService.formatActivityDescription,
    getActivityIcon: activityService.getActivityIcon
  };
};