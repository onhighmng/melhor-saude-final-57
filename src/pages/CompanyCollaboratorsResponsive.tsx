import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileCompanyEmployees } from '@/components/mobile/company/MobileCompanyEmployees';
import CompanyCollaborators from './CompanyCollaborators';

export default function CompanyCollaboratorsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileCompanyEmployees />}
      desktopComponent={<CompanyCollaborators />}
    />
  );
}

