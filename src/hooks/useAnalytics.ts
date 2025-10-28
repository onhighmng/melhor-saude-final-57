import { useState } from 'react';
import { mockAnalytics } from '@/data/mockData';

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
  const [data] = useState<AnalyticsData | null>(mockAnalytics);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, isLoading, error, refetch: () => {} };
};