import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import PillarSelection from './PillarSelection';
import { TopicSelection } from './TopicSelection';
import { PreDiagnosticChat } from './PreDiagnosticChat';
import { ProviderAssignmentStep } from './ProviderAssignmentStep';
import CalendarStep from './CalendarStep';
import { ConfirmationStep } from './ConfirmationStep';
import TopicSelectionLegal from '@/components/legal-assessment/TopicSelection';
import SymptomSelection from '@/components/legal-assessment/SymptomSelection';
import AssessmentResult from '@/components/legal-assessment/AssessmentResult';
import { BookingPillar } from './BookingFlow';
import { getTopicPillarId } from '@/utils/pillarMapping';
import { mockProviders } from '@/data/mockData';

type BookingStep = 'pillar' | 'topic' | 'legal-topic-selection' | 'legal-symptom-selection' | 'legal-assessment-result' | 'chat' | 'provider' | 'datetime' | 'confirmation';

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
  
  // Legal assessment state
  const [selectedLegalTopics, setSelectedLegalTopics] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    console.log('[DirectBookingFlow] Step:', currentStep, 'Pillar:', selectedPillar, 'Topic:', selectedTopic);
  }, [currentStep, selectedPillar, selectedTopic]);

  const handlePillarSelect = (pillar: BookingPillar) => {
    setSelectedPillar(pillar);
    
    // For juridica pillar, start with legal topic selection
    if (pillar === 'juridica') {
      setCurrentStep('legal-topic-selection');
    } else {
      setCurrentStep('topic');
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleTopicNext = () => {
    setCurrentStep('chat');
  };
  
  // Legal assessment handlers
  const handleLegalTopicToggle = (topicId: string) => {
    setSelectedLegalTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleNotesChange = (notes: string) => {
    setAdditionalNotes(notes);
  };

  const handleStartLegalChat = () => {
    // Set a default topic for legal chat (using the first selected legal topic)
    if (selectedLegalTopics.length > 0 && !selectedTopic) {
      setSelectedTopic('legal-assessment'); // Use a generic topic identifier for legal
    }
    setCurrentStep('chat');
  };

  const handleChatComplete = (sessionId: string) => {
    setChatSessionId(sessionId);
    
    // Assistente tentou resolver mas não conseguiu
    // Escala automaticamente para funcionário interno generalista
    if (selectedPillar) {
      const internalProvider: Provider = {
        id: 'internal-gp-001',
        name: 'Dr. João Silva',
        specialty: t(`user:booking.provider.internalSpecialist.${selectedPillar}`),
        pillar: getTopicPillarId(selectedPillar),
        avatar_url: '/lovable-uploads/business-meeting.png',
        rating: 5.0,
        experience: '10+ anos de experiência',
        availability: 'Disponível'
      };
      
      setAssignedProvider(internalProvider);
      setCurrentStep('provider');
      
      toast({
        title: t('user:booking.toasts.escalatingToSpecialist'),
        description: t('user:booking.toasts.escalatingDesc'),
      });
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
      case 'legal-topic-selection':
        setCurrentStep('pillar');
        setSelectedPillar(null);
        setSelectedLegalTopics([]);
        break;
      case 'legal-symptom-selection':
        setCurrentStep('legal-topic-selection');
        setSelectedSymptoms([]);
        break;
      case 'legal-assessment-result':
        setCurrentStep('legal-symptom-selection');
        break;
      case 'chat':
        if (selectedPillar === 'juridica') {
          setCurrentStep('legal-assessment-result');
        } else {
          setCurrentStep('topic');
          setSelectedTopic(null);
        }
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

      {currentStep === 'legal-topic-selection' && (
        <TopicSelectionLegal
          selectedTopics={selectedLegalTopics}
          onTopicToggle={handleLegalTopicToggle}
          onNext={() => setCurrentStep('legal-symptom-selection')}
          onBack={handleBack}
        />
      )}

      {currentStep === 'legal-symptom-selection' && (
        <SymptomSelection
          selectedTopics={selectedLegalTopics}
          selectedSymptoms={selectedSymptoms}
          onSymptomToggle={handleSymptomToggle}
          additionalNotes={additionalNotes}
          onNotesChange={handleNotesChange}
          onNext={() => setCurrentStep('legal-assessment-result')}
          onBack={handleBack}
        />
      )}

      {currentStep === 'legal-assessment-result' && (
        <AssessmentResult
          selectedTopics={selectedLegalTopics}
          selectedSymptoms={selectedSymptoms}
          additionalNotes={additionalNotes}
          onStartChat={handleStartLegalChat}
          onBack={handleBack}
        />
      )}

      {currentStep === 'chat' && selectedPillar && (
        <PreDiagnosticChat
          pillar={selectedPillar}
          topic={selectedTopic || 'legal-assessment'}
          onBack={handleBack}
          onComplete={handleChatComplete}
          legalContext={selectedPillar === 'juridica' ? {
            selectedTopics: selectedLegalTopics,
            selectedSymptoms: selectedSymptoms,
            additionalNotes: additionalNotes,
          } : undefined}
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
