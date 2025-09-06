import React from 'react';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SessionBalanceCard } from '@/components/dashboard/SessionBalanceCard';
import { ProviderPillars } from '@/components/dashboard/ProviderPillars';
import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions';
import { QuickHistory } from '@/components/dashboard/QuickHistory';
import { HelpResources } from '@/components/dashboard/HelpResources';

const UserDashboard = () => {
  const { sessionBalance, loading: sessionLoading } = useSessionBalance();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Modern Header Section */}
        <DashboardHeader />
        
        {/* Session Balance - Clean Hero Card */}
        <div className="relative">
          <SessionBalanceCard 
            sessionBalance={sessionBalance} 
            loading={sessionLoading} 
          />
        </div>
        
        {/* Main Content Grid - Clean Layout */}
        <div className="grid gap-6">
          {/* Providers Section */}
          <ProviderPillars />
          
          {/* Sessions & History Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <UpcomingSessions />
            <QuickHistory />
          </div>
          
          {/* Help Resources */}
          <HelpResources />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;