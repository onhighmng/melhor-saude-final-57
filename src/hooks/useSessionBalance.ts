import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SessionBalance } from '@/types/session';

export const useSessionBalance = () => {
  const { user, isLoading: isAuthLoading } = useAuth(); // Depend on the auth loading state
  const [sessionBalance, setSessionBalance] = useState<SessionBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    // DO NOT run if auth is loading or there's no user. This is the key fix.
    if (isAuthLoading || !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data: employee, error: fetchError } = await supabase
        .from('company_employees')
        .select('sessions_allocated, sessions_used')
        .eq('user_id', user.id)
        .single(); // Use .single() as a user should only belong to one company record.

      if (fetchError) {
        // Handle the case where a user might not be a company employee
        if (fetchError.code === 'PGRST116') { // "Not a single row was found"
          setSessionBalance({
            totalRemaining: 0,
            employerRemaining: 0,
            personalRemaining: 0,
            hasActiveSessions: false,
          });
        } else {
          throw fetchError;
        }
      } else if (employee) {
        const remaining = (employee.sessions_allocated || 0) - (employee.sessions_used || 0);
        setSessionBalance({
          totalRemaining: remaining,
          employerRemaining: remaining,
          personalRemaining: 0, // Assuming no personal plans for now
          hasActiveSessions: remaining > 0,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session balance';
      setError(errorMessage);
      console.error("useSessionBalance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This effect now correctly waits for the auth state to be finalized.
    refetch();

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
  }, [user, isAuthLoading]); // Re-run when auth loading state changes.

  return {
    sessionBalance,
    loading: loading || isAuthLoading, // The hook is loading if auth is loading OR it is fetching
    error,
    refetch,
    shouldShowPaymentButton: sessionBalance ? !sessionBalance.hasActiveSessions : false
  };
};
