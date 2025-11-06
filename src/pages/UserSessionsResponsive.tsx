import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileUserSessions } from '@/components/mobile/user/MobileUserSessions';
import UserSessions from './UserSessions';

export default function UserSessionsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileUserSessions />}
      desktopComponent={<UserSessions />}
    />
  );
}

