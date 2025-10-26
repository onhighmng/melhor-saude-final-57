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
      
      // Fetch basic counts directly from tables
      const [usersResult, providersResult, companiesResult, bookingsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('prestadores').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true })
      ]);
      
      setData({
        total_users: usersResult.count || 0,
        active_users: usersResult.count || 0,
        total_prestadores: providersResult.count || 0,
        active_prestadores: providersResult.count || 0,
        total_companies: companiesResult.count || 0,
        total_bookings: bookingsResult.count || 0,
        pending_change_requests: 0,
        sessions_allocated: 0,
        sessions_used: 0
      });
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