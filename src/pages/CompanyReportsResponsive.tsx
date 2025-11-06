import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileCompanyReports } from '@/components/mobile/company/MobileCompanyReports';
import CompanyReportsImpact from './CompanyReportsImpact';

export default function CompanyReportsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileCompanyReports />}
      desktopComponent={<CompanyReportsImpact />}
    />
  );
}

