import { useNavigate } from 'react-router-dom';
import { UniversalAIChat } from '@/components/booking/UniversalAIChat';

const UserChat = () => {
  const navigate = useNavigate();

  return (
    <UniversalAIChat onClose={() => navigate('/user/dashboard')} />
  );
};

export default UserChat;
