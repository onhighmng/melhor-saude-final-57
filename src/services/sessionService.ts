import { supabase } from '@/integrations/supabase/client';
import { UserSessionData, SessionBalance } from '@/types/session';

class SessionService {
  async getUserSessionData(): Promise<UserSessionData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get session balance from the database function
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('calculate_user_session_balance', { p_user_id: user.id });

      if (balanceError) {
        console.error('Error fetching session balance:', balanceError);
        return null;
      }

      const balance = balanceData?.[0];
      if (!balance) return null;

      // Get user profile for company info
      const { data: profile } = await supabase
        .from('profiles')
        .select('company')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        userId: user.id,
        employerQuota: balance.company_allocated > 0 ? {
          totalSessions: balance.company_allocated,
          usedSessions: balance.company_used,
          companyName: profile?.company || ''
        } : null,
        personalPlan: balance.personal_allocated > 0 ? {
          totalSessions: balance.personal_allocated,
          usedSessions: balance.personal_used,
          planType: 'basic'
        } : null
      };
    } catch (error) {
      console.error('Error fetching user session data:', error);
      return null;
    }
  }

  calculateSessionBalance(sessionData: UserSessionData): SessionBalance {
    const employerRemaining = sessionData.employerQuota 
      ? Math.max(0, sessionData.employerQuota.totalSessions - sessionData.employerQuota.usedSessions)
      : 0;
    
    const personalRemaining = sessionData.personalPlan
      ? Math.max(0, sessionData.personalPlan.totalSessions - sessionData.personalPlan.usedSessions)
      : 0;
    
    const totalRemaining = employerRemaining + personalRemaining;
    
    return {
      totalRemaining,
      employerRemaining,
      personalRemaining,
      hasActiveSessions: totalRemaining > 0
    };
  }

  async getSessionBalance(): Promise<SessionBalance | null> {
    const sessionData = await this.getUserSessionData();
    if (!sessionData) return null;
    
    return this.calculateSessionBalance(sessionData);
  }

  async useSession(source: 'employer' | 'personal' = 'employer'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const allocationType = source === 'employer' ? 'company' : 'personal';
      
      const { data, error } = await supabase
        .rpc('use_session', {
          p_user_id: user.id,
          p_allocation_type: allocationType
        });

      if (error) {
        console.error('Error using session:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error using session:', error);
      return false;
    }
  }

  async getSessionHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('session_usage')
        .select(`
          *,
          session_allocations!inner(allocation_type),
          prestadores(name)
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching session history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }
}

export const sessionService = new SessionService();