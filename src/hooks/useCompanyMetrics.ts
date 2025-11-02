import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyMetrics } from '@/data/companyMetrics';

export const useCompanyMetrics = (companyId?: string) => {
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get company seat and session stats using RPC function
        const { data: seatStats, error: seatError } = await supabase
          .rpc('get_company_seat_stats' as any, { p_company_id: companyId })
          .single();

        if (seatError) throw seatError;

        const stats = seatStats as any;
        const activeEmployees = stats.active_employees || 0;
        const totalEmployees = activeEmployees + (stats.pending_invites || 0);
        const sessionsAllocated = stats.sessions_allocated || 0;
        const sessionsUsed = stats.sessions_used || 0;

        // Get employee IDs for booking queries
        const { data: employees, error: employeesError } = await supabase
          .from('company_employees')
          .select('user_id')
          .eq('company_id', companyId);

        if (employeesError) throw employeesError;

        // Get session data for employees of this company
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('status, pillar, rating')
          .eq('company_id', companyId);

        if (bookingsError) throw bookingsError;

        const totalSessions = bookings?.length || 0;
        const completedSessions = bookings?.filter(b => b.status === 'completed').length || 0;
        
        // Calculate average rating from bookings
        const avgSatisfaction = bookings?.length 
          ? bookings.reduce((sum, b) => {
              const rating = 'rating' in b ? (b.rating as number) : 0;
              return sum + rating;
            }, 0) / bookings.length 
          : 0;

        // Calculate most used pillar
        const pillarCounts: Record<string, number> = {};
        bookings?.forEach(booking => {
          if (booking.pillar) {
            pillarCounts[booking.pillar] = (pillarCounts[booking.pillar] || 0) + 1;
          }
        });
        const mostUsedPillar = Object.entries(pillarCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Calculate utilization using data from RPC
        const utilizationRate = sessionsAllocated > 0
          ? Math.round((sessionsUsed / sessionsAllocated) * 100)
          : 0;

        setMetrics({
          activeEmployees,
          totalSessions,
          avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
          utilizationRate,
          totalEmployeesInPlan: stats.employee_seats || 0,
          registeredEmployees: activeEmployees,
          unregisteredEmployees: (stats.employee_seats || 0) - activeEmployees,
          contractedSessions: sessionsAllocated,
          usedSessions: sessionsUsed,
          mostUsedPillar,
          activePercentage: Math.round((activeEmployees / totalEmployees) * 100) || 0,
          inactivePercentage: Math.round(((totalEmployees - activeEmployees) / totalEmployees) * 100) || 0
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [companyId]);

  return { metrics, isLoading, error };
};

