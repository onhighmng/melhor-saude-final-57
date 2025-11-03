import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_prestadores: number;
  active_prestadores: number;
  total_companies: number;
  total_bookings: number;
  sessions_this_month: number;
  pending_change_requests: number;
  sessions_allocated: number;
  sessions_used: number;
  avg_rating?: number;
  pillarTrends?: {
    weekly: Array<{ pillar: string; count: number; percentage: number }>;
    monthly: Array<{ pillar: string; count: number; percentage: number }>;
    overall: Array<{ pillar: string; count: number; percentage: number }>;
  };
  sessionActivity?: Array<{ date: string; count: number }>;
  pillarDistribution?: Array<{ pillar: string; count: number }>;
}

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated - showing default analytics');
        setData({
          total_users: 0,
          active_users: 0,
          total_prestadores: 0,
          active_prestadores: 0,
          total_companies: 0,
          total_bookings: 0,
          sessions_this_month: 0,
          pending_change_requests: 0,
          sessions_allocated: 0,
          sessions_used: 0,
          avg_rating: 0
        });
        setLoading(false);
        return;
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000)
      );

      const analyticsPromise = async () => {
        // Calculate start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Fetch basic counts directly from tables with individual error handling
        const results = await Promise.allSettled([
          // Count only company employees (users with role='user' and company_id)
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user').not('company_id', 'is', null),
          supabase.from('prestadores').select('id', { count: 'exact', head: true }),
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          // Count bookings created this month
          supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
          supabase.from('companies').select('sessions_allocated, sessions_used'),
          supabase.from('bookings').select('rating').not('rating', 'is', null)
        ]);

        // Extract data with fallbacks
        const usersResult = results[0].status === 'fulfilled' ? results[0].value : { count: 0 };
        const providersResult = results[1].status === 'fulfilled' ? results[1].value : { count: 0 };
        const companiesResult = results[2].status === 'fulfilled' ? results[2].value : { count: 0 };
        const bookingsResult = results[3].status === 'fulfilled' ? results[3].value : { count: 0 };
        const sessionsThisMonthResult = results[4].status === 'fulfilled' ? results[4].value : { count: 0 };
        const companiesData = results[5].status === 'fulfilled' ? results[5].value : { data: [] };
        const ratingsData = results[6].status === 'fulfilled' ? results[6].value : { data: [] };

        // Calculate session totals safely
        const sessionTotals = (companiesData.data || []).reduce((acc, company) => ({
          allocated: acc.allocated + (company.sessions_allocated || 0),
          used: acc.used + (company.sessions_used || 0)
        }), { allocated: 0, used: 0 });

        // Calculate average rating safely
        const ratings = (ratingsData.data || []).map(r => r.rating).filter(r => r !== null);
        const avgRating = ratings.length > 0 
          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
          : 0;
        
        return {
          total_users: usersResult.count || 0,
          active_users: usersResult.count || 0,
          total_prestadores: providersResult.count || 0,
          active_prestadores: providersResult.count || 0,
          total_companies: companiesResult.count || 0,
          total_bookings: bookingsResult.count || 0,
          sessions_this_month: sessionsThisMonthResult.count || 0,
          pending_change_requests: 0,
          sessions_allocated: sessionTotals.allocated,
          sessions_used: sessionTotals.used,
          avg_rating: avgRating
        };
      };

      const analyticsData = await Promise.race([analyticsPromise(), timeoutPromise]);
      setData(analyticsData as AnalyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      console.warn('Analytics fetch error:', errorMessage);
      
      // Set default values to prevent infinite loading
      setData({
        total_users: 0,
        active_users: 0,
        total_prestadores: 0,
        active_prestadores: 0,
        total_companies: 0,
        total_bookings: 0,
        sessions_this_month: 0,
        pending_change_requests: 0,
        sessions_allocated: 0,
        sessions_used: 0,
        avg_rating: 0
      });
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { data, isLoading: loading, error, refetch: fetchAnalytics };
};