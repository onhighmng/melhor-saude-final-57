import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileCompanyResources } from '@/components/mobile/company/MobileCompanyResources';
import CompanyResources from './CompanyResources';

export default function CompanyResourcesResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileCompanyResources />}
      desktopComponent={<CompanyResources />}
    />
  );
}

