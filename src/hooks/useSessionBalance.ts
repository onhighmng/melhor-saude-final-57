
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SessionBalance } from '@/types/session';

export const useSessionBalance = () => {
  const { user } = useAuth();
  const [sessionBalance, setSessionBalance] = useState<SessionBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: employee, error: fetchError } = await supabase
        .from('company_employees')
        .select('sessions_allocated, sessions_used')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (employee) {
        setSessionBalance({
          totalRemaining: employee.sessions_allocated - employee.sessions_used,
          employerRemaining: employee.sessions_allocated - employee.sessions_used,
          personalRemaining: 0,
          hasActiveSessions: (employee.sessions_allocated - employee.sessions_used) > 0
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session balance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();

    // Add real-time subscription
    if (user?.id) {
      const subscription = supabase
        .channel('session-balance-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'company_employees',
          filter: `user_id=eq.${user.id}`
        }, () => {
          refetch();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
    
    return undefined;
  }, [user]);

  return {
    sessionBalance,
    loading,
    error,
    refetch,
    shouldShowPaymentButton: sessionBalance ? !sessionBalance.hasActiveSessions : false
  };
};
