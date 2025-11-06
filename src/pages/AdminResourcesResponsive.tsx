import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileAdminResources } from '@/components/mobile/admin/MobileAdminResources';
import AdminResources from './AdminResources';

export default function AdminResourcesResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileAdminResources />}
      desktopComponent={<AdminResources />}
    />
  );
}

