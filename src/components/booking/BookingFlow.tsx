import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PillarSelection from './PillarSelection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { useToast } from '@/hooks/use-toast';
import LegalAssessmentFlow from '@/components/legal-assessment/LegalAssessmentFlow';
import MentalHealthAssessmentFlow from '@/components/mental-health-assessment/MentalHealthAssessmentFlow';
import PhysicalWellnessAssessmentFlow from '@/components/physical-wellness-assessment/PhysicalWellnessAssessmentFlow';
import FinancialAssistanceAssessmentFlow from '@/components/financial-assistance-assessment/FinancialAssistanceAssessmentFlow';
import PreDiagnosticChat from '@/components/legal-assessment/PreDiagnosticChat';
import { getBookingConfirmationEmail } from '@/utils/emailTemplates';
import { emailService } from '@/services/emailService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput } from '@/utils/sanitize';

export type BookingPillar = 'psicologica' | 'financeira' | 'juridica' | 'fisica';

interface MockProvider {
  id: string;
  name: string;
  specialty: string;
  pillar: string;
  avatar_url: string;
  rating: number;
  experience: string;
  availability: string;
}

const BookingFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<'pillar' | 'topic-selection' | 'symptom-selection' | 'assessment-result' | 'specialist-choice' | 'assessment' | 'datetime' | 'confirmation' | 'prediagnostic-cta' | 'prediagnostic-chat'>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MockProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<'virtual' | 'phone'>('virtual');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  
  // Reschedule mode state
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [originalBooking, setOriginalBooking] = useState<Record<string, unknown> | null>(null);
  const isRescheduleMode = searchParams.get('mode') === 'reschedule';

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Load reschedule data on mount
  useEffect(() => {
    const loadRescheduleData = async () => {
      const bookingId = sessionStorage.getItem('reschedule_booking_id');
      if (bookingId && isRescheduleMode) {
        setRescheduleBookingId(bookingId);
        
        // Load original booking
        const { data: booking, error } = await supabase
          .from('bookings')
          .select(`
            *,
            prestadores!bookings_prestador_id_fkey (
              id,
              name,
              photo_url
            )
          `)
          .eq('id', bookingId)
          .single();

        if (booking && !error) {
          setOriginalBooking(booking);
          
          // Reverse pillar mapping
          const reversePillarMap: Record<string, BookingPillar> = {
            'saude_mental': 'psicologica',
            'bem_estar_fisico': 'fisica',
            'assistencia_financeira': 'financeira',
            'assistencia_juridica': 'juridica'
          };
          
          setSelectedPillar(reversePillarMap[booking.pillar] || null);
          
          if (booking.prestadores) {
            setSelectedProvider({
              id: booking.prestadores.id,
              name: booking.prestadores.name || '',
              specialty: 'Especialista',
              pillar: booking.pillar,
              avatar_url: booking.prestadores.photo_url || '',
              rating: 5,
              experience: 'Anos de experiência',
              availability: 'Disponível'
            });
          }
          
          // Pre-fill date and time
          const bookingData = booking as any; // Type assertion for outdated schema
          if (bookingData.booking_date) {
            setSelectedDate(new Date(bookingData.booking_date));
          }
          if (bookingData.start_time) {
            setSelectedTime(bookingData.start_time);
          }
          
          // Show reschedule banner and go to datetime step
          setCurrentStep('datetime');
          
          toast({
            title: 'Reagendar Sessão',
            description: 'Modifique a data, hora ou prestador conforme necessário.'
          });
        }
      }
    };

    loadRescheduleData();
  }, [isRescheduleMode]);

  const handlePillarSelect = (pillar: BookingPillar) => {
    setSelectedPillar(pillar);
    // ALL pillars now start with topic selection
    setCurrentStep('topic-selection');
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev =>
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

  const handleChooseAI = () => {
    setCurrentStep('assessment');
  };

  const handleChooseHuman = async () => {
    const pillarMapping = {
      'psicologica': 'saude_mental',
      'fisica': 'bem_estar_fisico',
      'financeira': 'assistencia_financeira',
      'juridica': 'assistencia_juridica'
    };

    const mappedPillar = pillarMapping[selectedPillar!];
    
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

    const assignedProvider = {
      id: availableProviders[0].id,
      name: availableProviders[0].name,
      specialty: availableProviders[0].specialties?.[0] || 'Especialista',
      pillar: mappedPillar,
      avatar_url: availableProviders[0].photo_url || '',
      rating: 5,
      experience: 'Anos de experiência',
      availability: 'Disponível'
    };
    
      setSelectedProvider(assignedProvider);
      setCurrentStep('datetime');
      
      toast({
        title: 'Especialista Atribuído',
      description: `Foi-lhe atribuído ${assignedProvider.name}`,
    });
  };


  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma data e hora para a sessão',
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleBookingConfirm = async () => {
    try {
      if (!profile?.id || !selectedProvider || !selectedDate || !selectedTime) {
        toast({
          title: 'Erro',
          description: 'Informação em falta para criar agendamento',
          variant: 'destructive'
        });
        return;
      }

      // Map pillar to database format
      const pillarMap: Record<string, string> = {
        'psicologica': 'saude_mental',
        'fisica': 'bem_estar_fisico',
        'financeira': 'assistencia_financeira',
        'juridica': 'assistencia_juridica'
      };

      // RESCHEDULE FLOW
      if (isRescheduleMode && rescheduleBookingId) {
        // Calculate end time
        const [hour, minute] = selectedTime.split(':');
        const endTime = `${String((parseInt(hour) + 1)).padStart(2, '0')}:${minute}`;

        // Update existing booking
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            booking_date: selectedDate.toISOString().split('T')[0],
            start_time: selectedTime,
            end_time: endTime,
            prestador_id: selectedProvider.id,
            status: 'pending_confirmation',
            rescheduled_from: (originalBooking as Record<string, unknown>).booking_date as string,
            rescheduled_at: new Date().toISOString()
          })
          .eq('id', rescheduleBookingId);

        if (updateError) throw updateError;

        // Notify original provider if changed
        if (selectedProvider.id !== (originalBooking as Record<string, unknown>).prestador_id) {
          const prestadores = (originalBooking as Record<string, unknown>).prestadores as Record<string, unknown>;
          await supabase.from('notifications').insert({
            user_id: prestadores.user_id as string,
            type: 'booking_reassigned',
            title: 'Sessão Reagendada',
            message: `A sessão foi transferida para outro prestador.`,
            related_booking_id: rescheduleBookingId,
            priority: 'normal'
          });
        }

        // Notify new provider
        const prestadores = (originalBooking as Record<string, unknown>)?.prestadores as Record<string, unknown> | undefined;
        const prestadorUserId = prestadores?.user_id as string | undefined;
        if (prestadorUserId) {
          await supabase.from('notifications').insert({
            user_id: prestadorUserId,
            type: 'booking_rescheduled',
            title: isRescheduleMode ? 'Sessão Reagendada' : 'Nova Sessão',
            message: `Nova sessão para ${selectedDate.toLocaleDateString('pt-PT')} às ${selectedTime}. Aguarda confirmação.`,
            related_booking_id: rescheduleBookingId,
            priority: 'high'
          });
        }

        toast({
          title: 'Sessão reagendada',
          description: 'Aguarda confirmação do prestador.'
        });

        sessionStorage.removeItem('reschedule_booking_id');
        navigate('/user/sessions');
        return;
      }

      // NORMAL BOOKING FLOW
      
      // ========================================
      // STEP 1: CHECK SESSION QUOTA
      // ========================================
      const { data: employee, error: quotaError } = await supabase
        .from('company_employees')
        .select('company_id, sessions_allocated, sessions_used')
        .eq('user_id', profile.id)
        .maybeSingle();
      
      if (quotaError) throw quotaError;
      
      const companyId = employee?.company_id || null;
      
      if (employee) {
        const remaining = (employee.sessions_allocated || 0) - (employee.sessions_used || 0);
        
        // Block if no sessions remaining
        if (remaining <= 0) {
          toast({
            title: 'Sem Sessões Disponíveis',
            description: 'Não tem sessões disponíveis na sua quota. Contacte o seu RH para adicionar mais sessões.',
            variant: 'destructive'
          });
          return;
        }
        
        // Warn if running low (≤ 2 sessions)
        if (remaining <= 2) {
          toast({
            title: `⚠️ ${remaining} sessão${remaining !== 1 ? 'ões' : ''} restante${remaining !== 1 ? 's' : ''}`,
            description: 'A sua quota está quase esgotada. Considere solicitar mais sessões.',
            variant: 'default'
          });
        }
      }
      
      // ========================================
      // STEP 2: CHECK PROVIDER AVAILABILITY
      // ========================================
      const availabilityCheck: any = await (supabase
        .from('bookings')
        .select('id')
        .eq('prestador_id', selectedProvider.id)
        .eq('booking_date', selectedDate.toISOString().split('T')[0])
        .eq('start_time', selectedTime)
        .neq('status', 'cancelled')
        .maybeSingle() as any);
      
      const existingBooking = availabilityCheck.data;
      
      if (existingBooking) {
        toast({
          title: 'Horário Indisponível',
          description: 'Este horário já está reservado. Por favor, escolha outro.',
          variant: 'destructive'
        });
        return;
      }

      // Calculate end time (assuming 1 hour session)
      const [hour, minute] = selectedTime.split(':');
      const endTime = `${String((parseInt(hour) + 1)).padStart(2, '0')}:${minute}`;

      // Create booking with sanitized inputs
      const pillar = selectedPillar ? pillarMap[selectedPillar] : null;
      
      // Extract ONLY string values - force everything to primitives
      const user_id = profile.id && typeof profile.id === 'string' ? profile.id : String(profile.id || '');
      const company_id = companyId && typeof companyId === 'string' ? companyId : (companyId ? String(companyId) : null);
      const prestador_id = selectedProvider.id && typeof selectedProvider.id === 'string' ? selectedProvider.id : String(selectedProvider.id || '');
      
      const bookingData = {
        user_id: user_id,
        company_id: company_id,
        prestador_id: prestador_id,
        pillar: pillar,
        topic: selectedTopics.length > 0 ? sanitizeInput(selectedTopics.join(', ')) : null,
        booking_date: String(selectedDate.toISOString().split('T')[0]),
        start_time: String(selectedTime),
        end_time: String(endTime),
        status: 'scheduled',
        session_type: meetingType === 'virtual' ? 'virtual' : meetingType === 'phone' ? 'phone' : 'presencial',
        meeting_type: meetingType,
        quota_type: 'employer',
        meeting_link: meetingType === 'virtual' ? `https://meet.example.com/${profile.id}-${new Date().getTime()}` : null,
        notes: additionalNotes ? sanitizeInput(additionalNotes) : null,
        booking_source: 'direct'
      };
      
      console.log('[BookingFlow] Inserting booking with primitives:', bookingData);
      
      // Use Supabase client with clean data
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.error('[BookingFlow] Booking insert error:', error);
        throw error;
      }
      
      console.log('[BookingFlow] Booking created successfully:', booking);

      // Store booking ID for later chat session linking
      setLastBookingId(booking.id);

      // Track booking in user_progress (silently fail if error to not block booking)
      try {
        await supabase.from('user_progress').insert({
          user_id: String(profile.id),
          pillar: pillar,
          action_type: 'session_scheduled',
          action_date: new Date().toISOString(),
          metadata: {
            booking_id: String(booking.id),
            prestador_id: String(selectedProvider.id),
            booking_date: String(booking.booking_date || selectedDate.toISOString().split('T')[0])
          }
        });
      } catch (progressError) {
        console.error('[BookingFlow] Error tracking progress (non-blocking):', progressError);
      }

      // Note: Quota is NOT decremented here. It will be decremented automatically
      // by the database trigger when the session status changes to 'completed'.

      // Send confirmation email (method not implemented yet)
      // try {
      //   await emailService.sendBookingConfirmation(profile.email, {
      //     userName: profile.full_name || 'Utilizador',
      //     providerName: selectedProvider.name,
      //     date: selectedDate.toISOString(),
      //     time: selectedTime,
      //     pillar: pillar,
      //     meetingLink: booking.meeting_link || undefined,
      //     meetingType: meetingType
      //   });
      // } catch (emailError) {
      //   // Email send failed - silently continue, don't block booking
      // }

      toast({
        title: 'Sessão Agendada',
        description: `A sua sessão com ${selectedProvider.name} foi agendada para ${selectedDate.toLocaleDateString()} às ${selectedTime}`,
      });
    
    // If juridica pillar, show pre-diagnostic CTA
    if (selectedPillar === 'juridica') {
      setTimeout(() => {
        setCurrentStep('prediagnostic-cta');
      }, 1500);
    } else {
      // Navigate back to dashboard after booking
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 2000);
      }
    } catch (error) {
      console.error('[BookingFlow] Error creating booking:', error);
      
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
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'pillar':
        return <PillarSelection onPillarSelect={handlePillarSelect} />;
      
      case 'topic-selection':
        // Route to the correct assessment flow based on pillar
        if (selectedPillar === 'juridica') {
          return (
            <LegalAssessmentFlow
              onBack={() => setCurrentStep('pillar')}
              onComplete={() => navigate('/user/dashboard')}
              onChooseHuman={handleChooseHuman}
            />
          );
        } else if (selectedPillar === 'psicologica') {
          return (
            <MentalHealthAssessmentFlow
              onBack={() => setCurrentStep('pillar')}
              onComplete={() => navigate('/user/dashboard')}
              onChooseHuman={handleChooseHuman}
            />
          );
        } else if (selectedPillar === 'fisica') {
          return (
            <PhysicalWellnessAssessmentFlow
              onBack={() => setCurrentStep('pillar')}
              onComplete={() => navigate('/user/dashboard')}
              onChooseHuman={handleChooseHuman}
            />
          );
        } else if (selectedPillar === 'financeira') {
          return (
            <FinancialAssistanceAssessmentFlow
              onBack={() => setCurrentStep('pillar')}
              onComplete={() => navigate('/user/dashboard')}
              onChooseHuman={handleChooseHuman}
            />
          );
        }
        return null;
      
      case 'prediagnostic-cta':
        return (
          <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
            <Card className="max-w-2xl w-full">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Sessão Agendada com Sucesso!</CardTitle>
                <p className="text-muted-foreground">
                  A sua sessão foi agendada para {selectedDate?.toLocaleDateString()} às {selectedTime}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg">Como podemos ajudá-la melhor?</h3>
                  <p className="text-sm text-muted-foreground">
                    Para prepararmos a sua sessão, gostaríamos de conhecer melhor as suas necessidades
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Sessão mais personalizada e eficaz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Diagnóstico mais preciso das suas necessidades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Plano de ação mais adequado para si</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/user/dashboard')}
                    className="flex-1"
                  >
                    Saltar
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('prediagnostic-chat')}
                    className="flex-1"
                  >
                    Iniciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'prediagnostic-chat':
        return (
          <PreDiagnosticChat
            onBack={() => setCurrentStep('prediagnostic-cta')}
            onComplete={async (sessionId: string) => {
              // Link chat session to the booking
              if (lastBookingId && sessionId) {
                await supabase
                  .from('bookings')
                  .update({ chat_session_id: sessionId })
                  .eq('id', lastBookingId);
              }
              navigate('/user/dashboard');
            }}
          />
        );
      
      case 'datetime':
        return (
          <div className="min-h-screen">
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-2xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep('pillar')}
                  className="mb-6"
                >
                  Voltar
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Agendar Sessão com {selectedProvider?.name} ({selectedProvider?.specialty})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-h3 mb-3">Selecionar Data e Hora</h3>
                      <BookingCalendar
                        selectedDate={selectedDate || undefined}
                        onDateSelect={(date) => setSelectedDate(date || null)}
                        selectedTime={selectedTime}
                        onTimeSelect={(time) => setSelectedTime(time)}
                        timeSlots={timeSlots.map(time => ({ time, available: true }))}
                        showTimeSelection={true}
                        className="w-full"
                      />
                    </div>
                    
                    {selectedDate && selectedTime && (
                      <Button onClick={handleDateTimeConfirm} className="w-full mt-6">
                        Confirmar Sessão
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="min-h-screen">
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Confirmar Agendamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p><strong>Especialista:</strong> {selectedProvider?.name}</p>
                      <p><strong>Especialidade:</strong> {selectedProvider?.specialty}</p>
                      <p><strong>Data:</strong> {selectedDate?.toLocaleDateString()}</p>
                      <p><strong>Hora:</strong> {selectedTime}</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep('datetime')}
                      >
                        Voltar
                      </Button>
                      <Button onClick={handleBookingConfirm} className="flex-1">
                        Confirmar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      
      default:
        return <PillarSelection onPillarSelect={handlePillarSelect} />;
    }
  };

  return renderCurrentStep();
};

export default BookingFlow;