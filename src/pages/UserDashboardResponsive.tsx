import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileUserDashboard } from '@/components/mobile/user/MobileUserDashboard';
import UserDashboard from './UserDashboard';

/**
 * Responsive User Dashboard that automatically switches between mobile and desktop views
 */
export default function UserDashboardResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileUserDashboard />}
      desktopComponent={<UserDashboard />}
    />
  );
}

