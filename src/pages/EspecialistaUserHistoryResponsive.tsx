import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileSpecialistHistory } from '@/components/mobile/specialist/MobileSpecialistHistory';
import EspecialistaUserHistory from './EspecialistaUserHistory';

export default function EspecialistaUserHistoryResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileSpecialistHistory />}
      desktopComponent={<EspecialistaUserHistory />}
    />
  );
}

