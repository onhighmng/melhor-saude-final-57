import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileAdminDashboard } from '@/components/mobile/admin/MobileAdminDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Responsive Admin Dashboard that automatically switches between mobile and desktop views
 */
export default function AdminDashboardResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileAdminDashboard />}
      desktopComponent={<AdminDashboard />}
    />
  );
}

