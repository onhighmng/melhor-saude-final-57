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
        // Get company data
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('sessions_allocated, sessions_used, seats_allocated, seats_used')
          .eq('id', companyId)
          .single();

        if (companyError) throw companyError;

        // Get employee count
        const { data: employees, error: employeesError } = await supabase
          .from('company_employees')
          .select('id, is_active')
          .eq('company_id', companyId);

        if (employeesError) throw employeesError;

        const activeEmployees = employees?.filter(e => e.is_active).length || 0;
        const totalEmployees = employees?.length || 0;

        // Get session data
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('status, pillar')
          .in('user_id', employees?.map(e => e.id) || []);

        if (bookingsError) throw bookingsError;

        const totalSessions = bookings?.length || 0;
        const completedSessions = bookings?.filter(b => b.status === 'completed').length || 0;
        
        // Calculate satisfaction from session_feedback
        const { data: feedback, error: feedbackError } = await supabase
          .from('session_feedback')
          .select('rating')
          .in('booking_id', bookings?.map(b => b.id) || []);

        if (feedbackError && feedbackError.code !== 'PGRST116') throw feedbackError;

        const avgSatisfaction = feedback?.length 
          ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length 
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

        // Calculate utilization
        const utilizationRate = company.sessions_allocated > 0
          ? Math.round((company.sessions_used / company.sessions_allocated) * 100)
          : 0;

        setMetrics({
          activeEmployees,
          totalSessions,
          avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
          utilizationRate,
          totalEmployeesInPlan: company.seats_allocated || 0,
          registeredEmployees: activeEmployees,
          unregisteredEmployees: (company.seats_allocated || 0) - activeEmployees,
          contractedSessions: company.sessions_allocated || 0,
          usedSessions: company.sessions_used || 0,
          mostUsedPillar,
          activePercentage: Math.round((activeEmployees / totalEmployees) * 100) || 0,
          inactivePercentage: Math.round(((totalEmployees - activeEmployees) / totalEmployees) * 100) || 0
        });
      } catch (err) {
        console.error('Error fetching company metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [companyId]);

  return { metrics, isLoading, error };
};

