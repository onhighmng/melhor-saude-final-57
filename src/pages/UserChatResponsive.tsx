import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper';
import { MobileUserChat } from '@/components/mobile/user/MobileUserChat';
import { N8NChatInterface } from '@/components/chat/N8NChatInterface';

/**
 * Responsive User Chat that automatically switches between mobile and desktop views
 */
export default function UserChatResponsive() {
  return (
    <MobileResponsiveWrapper
      mobileComponent={<MobileUserChat />}
      desktopComponent={<N8NChatInterface />}
    />
  );
}

