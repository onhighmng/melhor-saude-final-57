import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileNotificationsPage } from '@/components/mobile/user/MobileNotificationsPage';
import UserNotifications from './UserNotifications';

/**
 * Responsive User Notifications that automatically switches between mobile and desktop views
 */
export default function UserNotificationsResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileNotificationsPage />}
      desktopComponent={<UserNotifications />}
    />
  );
}

