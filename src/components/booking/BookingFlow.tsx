import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillarSelection from './PillarSelection';
import { mockProviders } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { useToast } from '@/hooks/use-toast';
import LegalAssessmentFlow from '@/components/legal-assessment/LegalAssessmentFlow';
import PreDiagnosticChat from '@/components/legal-assessment/PreDiagnosticChat';
import TopicSelection from '@/components/legal-assessment/TopicSelection';
import SymptomSelection from '@/components/legal-assessment/SymptomSelection';
import AssessmentResult from '@/components/legal-assessment/AssessmentResult';
import { useTranslation } from 'react-i18next';

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
  const { toast } = useToast();
  const { t } = useTranslation('user');
  const [currentStep, setCurrentStep] = useState<'pillar' | 'topic-selection' | 'symptom-selection' | 'assessment-result' | 'specialist-choice' | 'assessment' | 'datetime' | 'confirmation' | 'prediagnostic-cta' | 'prediagnostic-chat'>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MockProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handlePillarSelect = (pillar: BookingPillar) => {
    setSelectedPillar(pillar);
    
    // For juridica pillar, start with topic selection
    if (pillar === 'juridica') {
      setCurrentStep('topic-selection');
      return;
    }
    
    // For other pillars, assign provider and go to datetime
    const pillarMapping = {
      'psicologica': 'saude_mental',
      'fisica': 'bem_estar_fisico', 
      'financeira': 'assistencia_financeira',
      'juridica': 'assistencia_juridica'
    };

    const mappedPillar = pillarMapping[pillar];
    const availableProviders = mockProviders.filter(provider => 
      provider.pillar === mappedPillar
    );

    if (availableProviders.length > 0) {
      const assignedProvider = availableProviders[0];
      setSelectedProvider(assignedProvider);
      setCurrentStep('datetime');
      
      toast({
        title: t('booking.toasts.providerAssigned'),
        description: t('booking.toasts.providerAssignedDesc', { name: assignedProvider.name, specialty: assignedProvider.specialty }),
      });
    } else {
      toast({
        title: t('booking.toasts.error'),
        description: t('booking.toasts.noProviders'),
        variant: "destructive"
      });
    }
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

  const handleChooseHuman = () => {
    // Assign a juridica provider and go to datetime
    const availableProviders = mockProviders.filter(provider => 
      provider.pillar === 'assistencia_juridica'
    );

    if (availableProviders.length > 0) {
      const assignedProvider = availableProviders[0];
      setSelectedProvider(assignedProvider);
      setCurrentStep('datetime');
      
      toast({
        title: t('booking.toasts.providerAssigned'),
        description: t('booking.toasts.providerAssignedDesc', { name: assignedProvider.name, specialty: assignedProvider.specialty }),
      });
    }
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: t('booking.toasts.error'),
        description: t('booking.toasts.selectDateTime'),
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleBookingConfirm = () => {
    toast({
      title: t('booking.toasts.sessionBooked'),
      description: t('booking.toasts.sessionBookedDesc', { 
        name: selectedProvider?.name, 
        date: selectedDate?.toLocaleDateString(), 
        time: selectedTime 
      }),
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
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'pillar':
        return <PillarSelection onPillarSelect={handlePillarSelect} />;
      
      case 'topic-selection':
        return (
          <TopicSelection
            selectedTopics={selectedTopics}
            onTopicToggle={handleTopicToggle}
            onNext={() => setCurrentStep('symptom-selection')}
            onBack={() => setCurrentStep('pillar')}
          />
        );
      
      case 'symptom-selection':
        return (
          <SymptomSelection
            selectedTopics={selectedTopics}
            selectedSymptoms={selectedSymptoms}
            onSymptomToggle={handleSymptomToggle}
            additionalNotes={additionalNotes}
            onNotesChange={handleNotesChange}
            onNext={() => setCurrentStep('assessment-result')}
            onBack={() => setCurrentStep('topic-selection')}
          />
        );
      
      case 'assessment-result':
        return (
          <AssessmentResult
            selectedTopics={selectedTopics}
            selectedSymptoms={selectedSymptoms}
            additionalNotes={additionalNotes}
            onStartChat={handleChooseAI}
            onBack={() => setCurrentStep('symptom-selection')}
          />
        );
      
      case 'specialist-choice':
        return (
          <div className="min-h-screen bg-soft-white">
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-4xl mx-auto">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep('pillar')}
                  className="mb-6"
                >
                  {t('booking.back')}
                </Button>

                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-navy-blue mb-3">
                    {t('booking.specialistChoice.title')}
                  </h1>
                  <p className="text-royal-blue">
                    {t('booking.specialistChoice.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card 
                    className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                    onClick={handleChooseAI}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold">{t('booking.specialistChoice.aiTitle')}</h3>
                      <p className="text-muted-foreground">
                        {t('booking.specialistChoice.aiDescription')}
                      </p>
                      <Button className="w-full mt-4">
                        {t('booking.specialistChoice.aiButton')}
                      </Button>
                    </div>
                  </Card>

                  <Card 
                    className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                    onClick={handleChooseHuman}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold">{t('booking.specialistChoice.humanTitle')}</h3>
                      <p className="text-muted-foreground">
                        {t('booking.specialistChoice.humanDescription')}
                      </p>
                      <Button className="w-full mt-4">
                        {t('booking.specialistChoice.humanButton')}
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'assessment':
        return (
          <LegalAssessmentFlow 
            onBack={() => setCurrentStep('specialist-choice')}
            onComplete={() => navigate('/user/dashboard')}
            onChooseHuman={() => navigate('/user/dashboard')}
          />
        );
      
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
                <CardTitle className="text-2xl">{t('booking.preDiagnostic.successTitle')}</CardTitle>
                <p className="text-muted-foreground">
                  {t('booking.preDiagnostic.successMessage', { 
                    date: selectedDate?.toLocaleDateString(), 
                    time: selectedTime 
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg">{t('booking.preDiagnostic.helpTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('booking.preDiagnostic.helpDescription')}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{t('booking.preDiagnostic.benefit1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{t('booking.preDiagnostic.benefit2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{t('booking.preDiagnostic.benefit3')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/user/dashboard')}
                    className="flex-1"
                  >
                    {t('booking.preDiagnostic.skipButton')}
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('prediagnostic-chat')}
                    className="flex-1"
                  >
                    {t('booking.preDiagnostic.startButton')}
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
            onComplete={() => navigate('/user/dashboard')}
          />
        );
      
      case 'datetime':
        return (
          <div className="min-h-screen bg-soft-white">
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-2xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep('pillar')}
                  className="mb-6"
                >
                  {t('booking.back')}
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('booking.dateTime.title', { name: selectedProvider?.name, specialty: selectedProvider?.specialty })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-h3 mb-3">{t('booking.dateTime.selectDateTime')}</h3>
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
                        {t('booking.dateTime.confirmSession')}
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
          <div className="min-h-screen bg-soft-white">
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('booking.confirmation.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p><strong>{t('booking.confirmation.provider')}</strong> {selectedProvider?.name}</p>
                      <p><strong>{t('booking.confirmation.specialty')}</strong> {selectedProvider?.specialty}</p>
                      <p><strong>{t('booking.confirmation.date')}</strong> {selectedDate?.toLocaleDateString()}</p>
                      <p><strong>{t('booking.confirmation.time')}</strong> {selectedTime}</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep('datetime')}
                      >
                        {t('booking.confirmation.back')}
                      </Button>
                      <Button onClick={handleBookingConfirm} className="flex-1">
                        {t('booking.confirmation.confirm')}
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