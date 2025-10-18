import { useSearchParams } from 'react-router-dom';
import UserBooking from '@/pages/UserBooking';
import { DirectBookingFlow } from './DirectBookingFlow';

const BookingRouter = () => {
  const [searchParams] = useSearchParams();
  const pillarParam = searchParams.get('pillar');

  // If there's a pillar parameter, show the DirectBookingFlow
  if (pillarParam && ['psicologica', 'fisica', 'financeira', 'juridica'].includes(pillarParam)) {
    return <DirectBookingFlow />;
  }

  // Otherwise, show the UserBooking page with pillar selection
  return <UserBooking />;
};

export default BookingRouter;
