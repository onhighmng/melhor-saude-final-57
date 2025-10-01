import { useState, useEffect } from 'react';
import { healthService, HealthCheckin, CreateHealthCheckinData } from '@/services/healthService';

export const useHealthData = () => {
  const [latestCheckin, setLatestCheckin] = useState<HealthCheckin | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthCheckin[]>([]);
  const [healthStats, setHealthStats] = useState({
    totalCheckins: 0,
    averageMood: 0,
    streakDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const [checkin, stats, history] = await Promise.all([
        healthService.getLatestHealthCheckin(),
        healthService.getHealthStats(),
        healthService.getHealthHistory(7) // Get last 7 days
      ]);
      
      setLatestCheckin(checkin);
      setHealthStats(stats);
      setHealthHistory(history);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitHealthCheckin = async (data: CreateHealthCheckinData) => {
    try {
      setSubmitting(true);
      const newCheckin = await healthService.createHealthCheckin(data);
      
      if (newCheckin) {
        setLatestCheckin(newCheckin);
        await fetchHealthData(); // Refresh stats
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting health check-in:', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const hasCheckedInToday = (): boolean => {
    if (!latestCheckin) return false;
    
    const today = new Date();
    const checkinDate = new Date(latestCheckin.created_at);
    
    return (
      today.getDate() === checkinDate.getDate() &&
      today.getMonth() === checkinDate.getMonth() &&
      today.getFullYear() === checkinDate.getFullYear()
    );
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return {
    latestCheckin,
    healthHistory,
    healthStats,
    loading,
    submitting,
    hasCheckedInToday,
    submitHealthCheckin,
    refetch: fetchHealthData
  };
};