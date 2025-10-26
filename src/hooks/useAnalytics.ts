import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_prestadores: number;
  active_prestadores: number;
  total_companies: number;
  total_bookings: number;
  pending_change_requests: number;
  sessions_allocated: number;
  sessions_used: number;
  pillarTrends?: {
    weekly: any[];
    monthly: any[];
    overall: any[];
  };
  sessionActivity?: any[];
  pillarDistribution?: any[];
}

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: analytics, error: analyticsError } = await supabase
        .rpc('get_platform_analytics');
      
      if (analyticsError) throw analyticsError;
      setData(analytics);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { data, isLoading: loading, error, refetch: fetchAnalytics };
};