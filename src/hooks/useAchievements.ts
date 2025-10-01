import { useState, useEffect } from 'react';
import { achievementsService, Achievement } from '@/services/achievementsService';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [achievementStats, setAchievementStats] = useState<{
    totalAchievements: number;
    milestones: number;
    latestAchievement?: Achievement;
  }>({
    totalAchievements: 0,
    milestones: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [allAchievements, recent, stats] = await Promise.all([
        achievementsService.getUserAchievements(),
        achievementsService.getRecentAchievements(3),
        achievementsService.getAchievementStats()
      ]);
      
      setAchievements(allAchievements);
      setRecentAchievements(recent);
      setAchievementStats(stats);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    recentAchievements,
    achievementStats,
    loading,
    refetch: fetchAchievements
  };
};