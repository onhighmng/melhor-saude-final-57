import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileSpecialistSettings } from '@/components/mobile/specialist/MobileSpecialistSettings';
import EspecialistaSettings from './EspecialistaSettings';

export default function EspecialistaSettingsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileSpecialistSettings />}
      desktopComponent={<EspecialistaSettings />}
    />
  );
}

