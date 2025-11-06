import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileSpecialistCalls } from '@/components/mobile/specialist/MobileSpecialistCalls';
import EspecialistaCallRequests from './EspecialistaCallRequests';

export default function EspecialistaCallRequestsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileSpecialistCalls />}
      desktopComponent={<EspecialistaCallRequests />}
    />
  );
}

