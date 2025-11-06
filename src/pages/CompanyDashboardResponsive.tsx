import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileCompanyDashboard } from '@/components/mobile/company/MobileCompanyDashboard';
import CompanyDashboard from './CompanyDashboard';

/**
 * Responsive Company Dashboard that automatically switches between mobile and desktop views
 */
export default function CompanyDashboardResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileCompanyDashboard />}
      desktopComponent={<CompanyDashboard />}
    />
  );
}

