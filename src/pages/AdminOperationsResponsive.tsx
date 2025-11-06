import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileAdminOperations } from '@/components/mobile/admin/MobileAdminOperations';
import AdminOperations from './AdminOperations';

export default function AdminOperationsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileAdminOperations />}
      desktopComponent={<AdminOperations />}
    />
  );
}

