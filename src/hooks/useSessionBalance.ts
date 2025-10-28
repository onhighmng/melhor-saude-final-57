
import { useState } from 'react';
import { mockSessionBalance } from '@/data/mockData';
import { SessionBalance } from '@/types/session';

export const useSessionBalance = () => {
  const [sessionBalance] = useState<SessionBalance | null>(mockSessionBalance);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const refetch = () => {
    // Mock refetch - do nothing since it's static data
  };

  return {
    sessionBalance,
    loading,
    error,
    refetch,
    shouldShowPaymentButton: sessionBalance ? !sessionBalance.hasActiveSessions : false
  };
};
