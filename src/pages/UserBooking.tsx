import { useState } from 'react';
import { UniversalAIChat } from '@/components/booking/UniversalAIChat';
import { useNavigate } from 'react-router-dom';

const UserBooking = () => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(true);

  const handleClose = () => {
    setShowChat(false);
    navigate('/user/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {showChat && <UniversalAIChat onClose={handleClose} />}
    </div>
  );
};

export default UserBooking;
