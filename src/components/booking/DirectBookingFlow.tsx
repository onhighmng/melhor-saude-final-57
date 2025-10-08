import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillarSelection from './PillarSelection';
import { TopicSelection } from './TopicSelection';
import { PreDiagnosticChat } from './PreDiagnosticChat';
import { BookingPillar } from './BookingFlow';

type BookingStep = 'pillar' | 'topic' | 'chat';

export const DirectBookingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const handlePillarSelect = (pillar: BookingPillar) => {
    setSelectedPillar(pillar);
    setCurrentStep('topic');
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleTopicNext = () => {
    setCurrentStep('chat');
  };

  const handleChatComplete = (sessionId: string) => {
    setChatSessionId(sessionId);
    // Navigate to regular booking flow with pre-filled data
    navigate('/user/book', { state: { pillar: selectedPillar, chatSessionId } });
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'topic':
        setCurrentStep('pillar');
        setSelectedPillar(null);
        break;
      case 'chat':
        setCurrentStep('topic');
        setSelectedTopic(null);
        break;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      {currentStep === 'pillar' && (
        <PillarSelection onPillarSelect={handlePillarSelect} />
      )}

      {currentStep === 'topic' && selectedPillar && (
        <TopicSelection
          pillar={selectedPillar}
          selectedTopic={selectedTopic}
          onTopicSelect={handleTopicSelect}
          onBack={handleBack}
          onNext={handleTopicNext}
        />
      )}

      {currentStep === 'chat' && selectedPillar && selectedTopic && (
        <PreDiagnosticChat
          pillar={selectedPillar}
          topic={selectedTopic}
          onBack={handleBack}
          onComplete={handleChatComplete}
        />
      )}
    </div>
  );
};
