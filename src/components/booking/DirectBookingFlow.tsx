import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import PillarSelection from './PillarSelection';
import { ProviderAssignmentStep } from './ProviderAssignmentStep';
import CalendarStep from './CalendarStep';
import { ConfirmationStep } from './ConfirmationStep';
import { MeetingTypeSelection } from './MeetingTypeSelection';
import MentalHealthAssessmentFlow from '@/components/mental-health-assessment/MentalHealthAssessmentFlow';
import PhysicalWellnessAssessmentFlow from '@/components/physical-wellness-assessment/PhysicalWellnessAssessmentFlow';
import FinancialAssistanceAssessmentFlow from '@/components/financial-assistance-assessment/FinancialAssistanceAssessmentFlow';
import LegalAssessmentFlow from '@/components/legal-assessment/LegalAssessmentFlow';
import { BookingPillar } from './BookingFlow';
import { mockProviders } from '@/data/mockData';

type BookingStep = 'pillar' | 'assessment' | 'provider' | 'meetingType' | 'datetime' | 'confirmation';

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
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Initialize state based on URL parameters to avoid flash
  const getInitialState = () => {
    const pillarParam = searchParams.get('pillar');
    if (pillarParam && ['psicologica', 'fisica', 'financeira', 'juridica'].includes(pillarParam)) {
      return {
        currentStep: 'assessment' as BookingStep,
        selectedPillar: pillarParam as BookingPillar
      };
    }
    return {
      currentStep: 'pillar' as BookingStep,
      selectedPillar: null as BookingPillar | null
    };
  };

  const initialState = getInitialState();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialState.currentStep);
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(initialState.selectedPillar);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [assignedProvider, setAssignedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<'virtual' | 'phone'>('virtual');
  const [isConfirming, setIsConfirming] = useState(false);

  // Update state when URL parameters change
  useEffect(() => {
    const pillarParam = searchParams.get('pillar');
    if (pillarParam && ['psicologica', 'fisica', 'financeira', 'juridica'].includes(pillarParam)) {
      setSelectedPillar(pillarParam as BookingPillar);
      setCurrentStep('assessment');
    } else if (!pillarParam && currentStep === 'assessment') {
      // If pillar parameter is removed, go back to pillar selection
      setSelectedPillar(null);
      setCurrentStep('pillar');
    }
  }, [searchParams, currentStep]);

  useEffect(() => {
    console.log('[DirectBookingFlow] Step:', currentStep, 'Pillar:', selectedPillar, 'Topic:', selectedTopic);
  }, [currentStep, selectedPillar, selectedTopic]);

  const handlePillarSelect = (pillar: BookingPillar) => {
    setSelectedPillar(pillar);
    setCurrentStep('assessment'); // ALL pillars go to assessment
  };

  const handleChooseHuman = () => {
    if (!selectedPillar) return;
    
    const pillarMapping = {
      'psicologica': 'saude_mental',
      'fisica': 'bem_estar_fisico',
      'financeira': 'assistencia_financeira',
      'juridica': 'assistencia_juridica'
    };

    const mappedPillar = pillarMapping[selectedPillar];
    const availableProviders = mockProviders.filter(provider => 
      provider.pillar === mappedPillar
    );

    if (availableProviders.length > 0) {
      const provider = availableProviders[0];
      const assignedProvider = {
        id: provider.id,
        name: provider.name,
        specialty: provider.specialty,
        pillar: provider.pillar || mappedPillar,
        avatar_url: provider.avatar_url,
        rating: provider.rating || 5.0,
        experience: provider.experience,
        availability: provider.availability || 'Disponível'
      };
      
      setAssignedProvider(assignedProvider);
      setSelectedTopic('assessment');
      setCurrentStep('provider');
      
      toast({
        title: 'Especialista Atribuído',
        description: `Foi-lhe atribuído ${assignedProvider.name} (${assignedProvider.specialty})`,
      });
    }
  };


  const handleProviderNext = () => {
    setCurrentStep('meetingType');
  };

  const handleMeetingTypeNext = (type: 'virtual' | 'phone') => {
    setMeetingType(type);
    setCurrentStep('datetime');
  };

  const handleDateTimeNext = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma data e hora para a sessão',
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
      title: 'Sessão Agendada',
      description: `A sua sessão com ${assignedProvider?.name} foi agendada para ${selectedDate?.toLocaleDateString('pt-PT')} às ${selectedTime}`,
    });
    
    setIsConfirming(false);
    
    // Navigate to dashboard
    setTimeout(() => {
      navigate('/user/dashboard');
    }, 1500);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'assessment':
        setCurrentStep('pillar');
        setSelectedPillar(null);
        break;
      case 'provider':
        setCurrentStep('assessment');
        break;
      case 'meetingType':
        setCurrentStep('provider');
        break;
      case 'datetime':
        setCurrentStep('meetingType');
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

      {currentStep === 'assessment' && selectedPillar === 'psicologica' && (
        <MentalHealthAssessmentFlow
          onBack={() => navigate('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'assessment' && selectedPillar === 'fisica' && (
        <PhysicalWellnessAssessmentFlow
          onBack={() => navigate('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'assessment' && selectedPillar === 'financeira' && (
        <FinancialAssistanceAssessmentFlow
          onBack={() => navigate('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'assessment' && selectedPillar === 'juridica' && (
        <LegalAssessmentFlow
          onBack={() => navigate('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'provider' && selectedPillar && assignedProvider && (
        <ProviderAssignmentStep
          pillar={selectedPillar}
          assignedProvider={assignedProvider}
          onNext={handleProviderNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 'meetingType' && (
        <MeetingTypeSelection
          onNext={handleMeetingTypeNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 'datetime' && selectedPillar && (
        <CalendarStep
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          onNext={handleDateTimeNext}
          onBack={handleBack}
          pillarName={selectedPillar === 'psicologica' ? 'Saúde Mental' : selectedPillar === 'fisica' ? 'Bem-estar Físico' : selectedPillar === 'financeira' ? 'Assistência Financeira' : 'Assistência Jurídica'}
        />
      )}

      {currentStep === 'confirmation' && selectedPillar && selectedTopic && assignedProvider && selectedDate && (
        <ConfirmationStep
          pillar={selectedPillar}
          topic={selectedTopic || 'assessment'}
          provider={assignedProvider}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          meetingType={meetingType}
          onBack={handleBack}
          onConfirm={handleConfirmBooking}
          isConfirming={isConfirming}
        />
      )}
    </div>
  );
};
