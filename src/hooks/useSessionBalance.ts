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
        .select('sessions_allocated, sessions_used, company_id')
        .eq('user_id', user.id)
        .maybeSingle(); // Use .maybeSingle() to handle cases where user is not a company employee

      if (fetchError) {
        throw fetchError;
      }
      
      if (!employee) {
        // User is not a company employee
        setSessionBalance({
          totalRemaining: 0,
          employerRemaining: 0,
          personalRemaining: 0,
          hasActiveSessions: false,
          companyQuota: 0,
          usedCompany: 0,
          personalQuota: 0,
          usedPersonal: 0,
          availableCompany: 0,
          availablePersonal: 0,
        });
      } else {
        const allocated = employee.sessions_allocated || 0;
        const used = employee.sessions_used || 0;
        const remaining = allocated - used;
        
        setSessionBalance({
          totalRemaining: remaining,
          employerRemaining: remaining,
          personalRemaining: 0, // Assuming no personal plans for now
          hasActiveSessions: remaining > 0,
          companyQuota: allocated,
          usedCompany: used,
          personalQuota: 0, // No personal quota for now
          usedPersonal: 0,
          availableCompany: remaining,
          availablePersonal: 0,
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
