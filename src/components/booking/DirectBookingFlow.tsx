import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import PillarSelection from './PillarSelection';
import { TopicSelection } from './TopicSelection';
import { PreDiagnosticChat } from './PreDiagnosticChat';
import { ProviderAssignmentStep } from './ProviderAssignmentStep';
import CalendarStep from './CalendarStep';
import { ConfirmationStep } from './ConfirmationStep';
import { BookingPillar } from './BookingFlow';
import { getTopicPillarId } from '@/utils/pillarMapping';
import { mockProviders } from '@/data/mockData';

type BookingStep = 'pillar' | 'topic' | 'chat' | 'provider' | 'datetime' | 'confirmation';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  pillar: string;
  avatar_url: string;
  rating: number;
  experience: string;
  availability: string;
}

export const DirectBookingFlow = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['user', 'common']);
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [assignedProvider, setAssignedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    console.log('[DirectBookingFlow] Step:', currentStep, 'Pillar:', selectedPillar, 'Topic:', selectedTopic);
  }, [currentStep, selectedPillar, selectedTopic]);

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
    
    // Assign provider based on pillar
    if (selectedPillar) {
      const topicPillarId = getTopicPillarId(selectedPillar);
      const availableProviders = mockProviders.filter(
        (provider: Provider) => provider.pillar === topicPillarId
      );

      if (availableProviders.length > 0) {
        const provider = availableProviders[0];
        setAssignedProvider(provider);
        setCurrentStep('provider');
        
        toast({
          title: t('user:booking.toasts.providerAssigned'),
          description: t('user:booking.toasts.providerAssignedDesc', { 
            name: provider.name, 
            specialty: provider.specialty 
          }),
        });
      } else {
        toast({
          title: t('errors:title'),
          description: t('user:booking.toasts.noProviders'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleProviderNext = () => {
    setCurrentStep('datetime');
  };

  const handleDateTimeNext = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: t('errors:title'),
        description: t('user:booking.toasts.selectDateTime'),
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    
    // Simulate booking creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: t('user:booking.toasts.sessionBooked'),
      description: t('user:booking.toasts.sessionBookedDesc', { 
        name: assignedProvider?.name,
        date: selectedDate?.toLocaleDateString(),
        time: selectedTime
      }),
    });
    
    setIsConfirming(false);
    
    // Navigate to dashboard
    setTimeout(() => {
      navigate('/user/dashboard');
    }, 1500);
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
      case 'provider':
        setCurrentStep('chat');
        break;
      case 'datetime':
        setCurrentStep('provider');
        break;
      case 'confirmation':
        setCurrentStep('datetime');
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

      {currentStep === 'provider' && selectedPillar && assignedProvider && (
        <ProviderAssignmentStep
          pillar={selectedPillar}
          assignedProvider={assignedProvider}
          onNext={handleProviderNext}
        />
      )}

      {currentStep === 'datetime' && selectedPillar && (
        <CalendarStep
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          onNext={handleDateTimeNext}
          pillarName={t(`user:booking.directFlow.pillars.${selectedPillar}.title`)}
        />
      )}

      {currentStep === 'confirmation' && selectedPillar && selectedTopic && assignedProvider && selectedDate && (
        <ConfirmationStep
          pillar={selectedPillar}
          topic={selectedTopic}
          provider={assignedProvider}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onBack={handleBack}
          onConfirm={handleConfirmBooking}
          isConfirming={isConfirming}
        />
      )}
    </div>
  );
};
