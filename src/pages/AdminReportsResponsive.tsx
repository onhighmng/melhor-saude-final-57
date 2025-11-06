import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileAdminReports } from '@/components/mobile/admin/MobileAdminReports';
import AdminReports from './AdminReports';

export default function AdminReportsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileAdminReports />}
      desktopComponent={<AdminReports />}
    />
  );
}

