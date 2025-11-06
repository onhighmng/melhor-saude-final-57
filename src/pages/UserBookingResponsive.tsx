import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams } from 'react-router-dom';
import { MobileBookingPage } from '@/components/mobile/user/MobileBookingPage';
import BookingRouter from '@/components/booking/BookingRouter';

/**
 * Responsive User Booking that automatically switches between mobile and desktop views
 * Mobile: Shows MobileBookingPage for initial pillar selection from Figma designs
 * After pillar selection: Uses desktop BookingFlow for the actual booking process
 * Desktop: Always shows BookingRouter
 */
export default function UserBookingResponsive() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const hasPillar = searchParams.has('pillar');
  
  // On mobile, only show MobileBookingPage when there's NO pillar parameter
  // Once a pillar is selected, use the desktop booking flow
  if (isMobile && !hasPillar) {
    return <MobileBookingPage />;
  }
  
  // Desktop OR mobile with pillar selected: use BookingRouter
  return <BookingRouter />;
}

