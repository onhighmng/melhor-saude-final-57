import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileSpecialistSessions } from '@/components/mobile/specialist/MobileSpecialistSessions';
import PrestadorSessions from './PrestadorSessions';

export default function SpecialistSessionsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileSpecialistSessions />}
      desktopComponent={<PrestadorSessions />}
    />
  );
}

