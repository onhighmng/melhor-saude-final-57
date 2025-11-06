import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileSpecialistDashboard } from '@/components/mobile/specialist/MobileSpecialistDashboard';
import SpecialistDashboard from './SpecialistDashboard';

/**
 * Responsive Specialist Dashboard that automatically switches between mobile and desktop views
 */
export default function SpecialistDashboardResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileSpecialistDashboard />}
      desktopComponent={<SpecialistDashboard />}
    />
  );
}

