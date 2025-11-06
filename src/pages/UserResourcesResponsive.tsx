import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileUserResources } from '@/components/mobile/user/MobileUserResources';
import UserResources from './UserResources';

export default function UserResourcesResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileUserResources />}
      desktopComponent={<UserResources />}
    />
  );
}

