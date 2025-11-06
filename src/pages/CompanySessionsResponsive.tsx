import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileCompanySessions } from '@/components/mobile/company/MobileCompanySessions';
import CompanySessions from './CompanySessions';

export default function CompanySessionsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileCompanySessions />}
      desktopComponent={<CompanySessions />}
    />
  );
}

