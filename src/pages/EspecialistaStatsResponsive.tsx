import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileSpecialistStats } from '@/components/mobile/specialist/MobileSpecialistStats';
import EspecialistaStatsRevamped from './EspecialistaStatsRevamped';

export default function EspecialistaStatsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileSpecialistStats />}
      desktopComponent={<EspecialistaStatsRevamped />}
    />
  );
}

