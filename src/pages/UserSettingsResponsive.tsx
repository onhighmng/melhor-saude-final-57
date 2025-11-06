import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileUserSettings } from '@/components/mobile/user/MobileUserSettings';
import UserSettings from './UserSettings';

export default function UserSettingsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileUserSettings />}
      desktopComponent={<UserSettings />}
    />
  );
}

