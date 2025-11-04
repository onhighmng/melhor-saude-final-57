import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { PillarsFrameLayout } from '@/components/ui/pillars-frame-layout';
import { ProviderAssignmentStep } from './ProviderAssignmentStep';
import CalendarStep from './CalendarStep';
import { ConfirmationStep } from './ConfirmationStep';
import MentalHealthAssessmentFlow from '@/components/mental-health-assessment/MentalHealthAssessmentFlow';
import PhysicalWellnessAssessmentFlow from '@/components/physical-wellness-assessment/PhysicalWellnessAssessmentFlow';
import FinancialAssistanceAssessmentFlow from '@/components/financial-assistance-assessment/FinancialAssistanceAssessmentFlow';
import LegalAssessmentFlow from '@/components/legal-assessment/LegalAssessmentFlow';
import { BookingPillar } from './BookingFlow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type BookingStep = 'pillar' | 'assessment' | 'provider' | 'datetime' | 'confirmation';

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
  const { profile } = useAuth();
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Update state when URL parameters change - only handle initial load
  useEffect(() => {
    const pillarParam = searchParams.get('pillar');
    if (pillarParam && ['psicologica', 'fisica', 'financeira', 'juridica'].includes(pillarParam)) {
      // Only initialize from URL if we don't have a selected pillar yet
      if (!selectedPillar) {
        setSelectedPillar(pillarParam as BookingPillar);
        setCurrentStep('assessment');
      }
    }
  }, [searchParams, selectedPillar]); // Only run when URL changes or selectedPillar is null

  // Debug logging removed for production

  // Function to get proper pillar name in Portuguese
  const getPillarDisplayName = (pillar: BookingPillar | null): string => {
    if (!pillar) return '';
    
    const pillarNames = {
      'psicologica': 'Saúde Mental',
      'fisica': 'Bem-estar Físico',
      'financeira': 'Assistência Financeira',
      'juridica': 'Assistência Jurídica'
    };
    
    return pillarNames[pillar] || '';
  };

  const handlePillarSelect = (pillarTitle: string) => {
    // Map Portuguese pillar titles to BookingPillar type
    const pillarMapping: Record<string, BookingPillar> = {
      'Saúde Mental': 'psicologica',
      'Bem-estar Físico': 'fisica',
      'Assistência Financeira': 'financeira',
      'Assistência Jurídica': 'juridica'
    };
    
    const mappedPillar = pillarMapping[pillarTitle];
    if (mappedPillar) {
      setSelectedPillar(mappedPillar);
      setCurrentStep('assessment'); // ALL pillars go to assessment
    }
  };

  const handleChooseHuman = async (sessionIdOrEvent?: string | any) => {
    if (!selectedPillar) return;
    
    // Filter out React events - only accept strings
    let sessionId: string | null = null;
    if (sessionIdOrEvent && typeof sessionIdOrEvent === 'string') {
      sessionId = sessionIdOrEvent;
    }
    
    // Store chat session ID if provided
    if (sessionId) {
      setChatSessionId(sessionId);
    }
    
    const pillarMapping = {
      'psicologica': 'saude_mental',
      'fisica': 'bem_estar_fisico',
      'financeira': 'assistencia_financeira',
      'juridica': 'assistencia_juridica'
    };

    const mappedPillar = pillarMapping[selectedPillar];
    
    const { data: availableProviders, error } = await supabase
      .from('prestadores')
      .select('id, name, specialties, photo_url, pillar_specialties')
      .contains('pillar_specialties', [mappedPillar])
      .eq('is_active', true)
      .limit(10);

    if (error || !availableProviders || availableProviders.length === 0) {
      toast({
        title: 'Erro',
        description: 'Não há especialistas disponíveis no momento.',
        variant: "destructive"
      });
      return;
    }

    const provider = availableProviders[0];
    const assignedProvider = {
      id: provider.id,
      name: provider.name,
      specialty: provider.specialties?.[0] || 'Especialista',
      pillar: mappedPillar,
      avatar_url: provider.photo_url || '',
      rating: 5.0,
      experience: 'Anos de experiência',
      availability: 'Disponível'
    };
    
    setAssignedProvider(assignedProvider);
    setSelectedTopic(getPillarDisplayName(selectedPillar));
    setCurrentStep('provider');
    
    toast({
      title: 'Especialista Atribuído',
      description: `Foi-lhe atribuído ${assignedProvider.name}`,
    });
  };


  const handleProviderNext = () => {
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
    if (!profile?.id || !assignedProvider || !selectedDate || !selectedTime) {
      toast({
        title: 'Erro',
        description: 'Informação em falta para criar agendamento',
        variant: 'destructive'
      });
      return;
    }

    setIsConfirming(true);
    
    try {
      // Map pillar to database format
      const pillarMap: Record<string, string> = {
        'psicologica': 'saude_mental',
        'fisica': 'bem_estar_fisico',
        'financeira': 'assistencia_financeira',
        'juridica': 'assistencia_juridica'
      };

      // Calculate end time (assuming 1 hour session)
      const [hour, minute] = selectedTime.split(':');
      const endTime = `${String((parseInt(hour) + 1)).padStart(2, '0')}:${minute}`;

      // Get company_id from company_employees table
      const { data: employee } = await supabase
        .from('company_employees')
        .select('company_id')
        .eq('user_id', profile.id)
        .maybeSingle();

      // Map pillar to database format
      const pillarMapping = {
        'psicologica': 'saude_mental',
        'fisica': 'bem_estar_fisico',
        'financeira': 'assistencia_financeira',
        'juridica': 'assistencia_juridica'
      };
      
      const dbPillar = selectedPillar ? pillarMapping[selectedPillar] : 'saude_mental';

      // Smart UUID extractor that handles strings, objects, and nulls
      const extractUUID = (value: any, fieldName: string): string | null => {
        // If null or undefined, return null
        if (value === null || value === undefined) {
          console.log(`[DirectBookingFlow] ${fieldName} is null/undefined`);
          return null;
        }
        
        // If already a string, return it
        if (typeof value === 'string') {
          console.log(`[DirectBookingFlow] ${fieldName} is string: ${value}`);
          return value;
        }
        
        // If it's an object (like a React event), handle it
        if (typeof value === 'object') {
          // Check if it's a React SyntheticEvent
          if (value._reactName || value.nativeEvent) {
            console.warn(`[DirectBookingFlow] ${fieldName} is a React event, ignoring and returning null`);
            return null;
          }
          
          console.error(`[DirectBookingFlow] ERROR: ${fieldName} is an object:`, value);
          if (value.id && typeof value.id === 'string') {
            console.log(`[DirectBookingFlow] Extracted ${fieldName}.id: ${value.id}`);
            return value.id;
          }
          
          // Object doesn't have a valid id, return null instead of throwing
          console.warn(`[DirectBookingFlow] ${fieldName} is an object without valid id, returning null`);
          return null;
        }
        
        // Fallback - convert to string
        console.warn(`[DirectBookingFlow] ${fieldName} is ${typeof value}, converting to string`);
        return String(value);
      };

      // Extract UUIDs with validation
      const user_id = extractUUID(profile?.id, 'profile.id');
      const company_id = extractUUID(employee?.company_id, 'company_id');
      const prestador_id = extractUUID(assignedProvider?.id, 'assignedProvider.id');
      const chat_session_id = extractUUID(chatSessionId, 'chatSessionId');

      // Create a COMPLETELY NEW plain object with ONLY string primitives
      const rawData = {
        user_id: user_id,
        company_id: company_id,
        prestador_id: prestador_id,
        chat_session_id: chat_session_id,
        pillar: String(dbPillar),
        booking_date: String(selectedDate.toISOString().split('T')[0]),
        start_time: String(selectedTime),
        end_time: String(endTime),
        status: 'scheduled',
        session_type: 'virtual',
        booking_source: 'direct'
      };

      console.log('[DirectBookingFlow] Clean booking data (all primitives):', rawData);

      // Now insert using Supabase client with the clean data
      const { error } = await supabase
        .from('bookings')
        .insert(rawData);

      if (error) {
        console.error('[DirectBookingFlow] Booking insert error:', error);
        throw error;
      }
      
      console.log('[DirectBookingFlow] Booking created successfully');

      // Auto-complete "booking_confirmed" milestone  
      try {
        await supabase
          .from('user_milestones')
          .update({ 
            completed: true, 
            completed_at: new Date().toISOString() 
          })
          .eq('user_id', String(profile.id))
          .eq('milestone_id', 'booking_confirmed') // FIXED: Use milestone_id (correct column name)
          .eq('completed', false); // Only update if not already completed
        
        console.log('[DirectBookingFlow] booking_confirmed milestone completed');
      } catch (milestoneError) {
        console.error('Error completing booking_confirmed milestone:', milestoneError);
        // Don't block the booking flow if milestone update fails
      }

      toast({
        title: 'Sessão Agendada',
        description: `A sua sessão com ${assignedProvider.name} foi agendada para ${selectedDate.toLocaleDateString('pt-PT')} às ${selectedTime}`,
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1500);
    } catch (error) {
      console.error('[DirectBookingFlow] Error creating booking:', error);
      
      // Extract only the error message, avoid passing the entire error object
      let errorMessage = 'Ocorreu um erro ao agendar a sessão';
      
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if ('error_description' in error && typeof error.error_description === 'string') {
          errorMessage = error.error_description;
        }
      }
      
      toast({
        title: 'Erro ao agendar',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsConfirming(false);
    }
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
                  Como podemos ajudar?
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-black max-w-3xl mx-auto">
                  Selecione a área em que precisa de apoio
                </p>
              </div>
              
              {/* Interactive Frame Layout */}
              <div className="h-[500px] w-full mb-8">
                <PillarsFrameLayout 
                  className="w-full h-full"
                  hoverSize={8}
                  gapSize={6}
                  onPillarSelect={handlePillarSelect}
                />
              </div>

              {/* Instructions */}
              <div className="text-center pb-12">
                <p className="text-black text-lg md:text-xl lg:text-2xl font-medium">
                  Clique na área que precisa de apoio
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'assessment' && selectedPillar === 'psicologica' && (
        <MentalHealthAssessmentFlow
          onBack={() => window.location.replace('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'assessment' && selectedPillar === 'fisica' && (
        <PhysicalWellnessAssessmentFlow
          onBack={() => window.location.replace('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'assessment' && selectedPillar === 'financeira' && (
        <FinancialAssistanceAssessmentFlow
          onBack={() => window.location.replace('/user/book')}
          onComplete={() => navigate('/user/dashboard')}
          onChooseHuman={handleChooseHuman}
        />
      )}

      {currentStep === 'assessment' && selectedPillar === 'juridica' && (
        <LegalAssessmentFlow
          onBack={() => window.location.replace('/user/book')}
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


      {currentStep === 'datetime' && selectedPillar && (
        <CalendarStep
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          onNext={handleDateTimeNext}
          onBack={handleBack}
          pillarName={selectedPillar === 'psicologica' ? 'Saúde Mental' : selectedPillar === 'fisica' ? 'Bem-estar Físico' : selectedPillar === 'financeira' ? 'Assistência Financeira' : 'Assistência Jurídica'}
          providerId={assignedProvider?.id}
        />
      )}

      {currentStep === 'confirmation' && selectedPillar && assignedProvider && selectedDate && (
        <ConfirmationStep
          pillar={selectedPillar}
          topic={selectedTopic || getPillarDisplayName(selectedPillar)}
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
