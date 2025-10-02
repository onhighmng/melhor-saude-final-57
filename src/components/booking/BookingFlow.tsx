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
  const [currentStep, setCurrentStep] = useState<'pillar' | 'specialist-choice' | 'assessment' | 'datetime' | 'confirmation' | 'prediagnostic-cta' | 'prediagnostic-chat'>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MockProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handlePillarSelect = (pillar: BookingPillar) => {
    setSelectedPillar(pillar);
    
    // For juridica pillar, show specialist choice first
    if (pillar === 'juridica') {
      setCurrentStep('specialist-choice');
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
        title: "Prestador Atribuído",
        description: `Foi atribuído: ${assignedProvider.name} - ${assignedProvider.specialty}`,
      });
    } else {
      toast({
        title: "Erro", 
        description: "Nenhum prestador disponível para este pilar no momento.",
        variant: "destructive"
      });
    }
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
        title: "Prestador Atribuído",
        description: `Foi atribuído: ${assignedProvider.name} - ${assignedProvider.specialty}`,
      });
    }
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Por favor selecione data e hora",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleBookingConfirm = () => {
    toast({
      title: "Sessão Agendada!",
      description: `Sua sessão com ${selectedProvider?.name} foi agendada para ${selectedDate?.toLocaleDateString()} às ${selectedTime}`,
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
                  ← Voltar
                </Button>

                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-navy-blue mb-3">
                    Como Prefere Obter Ajuda?
                  </h1>
                  <p className="text-royal-blue">
                    Selecione como prefere obter ajuda jurídica
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
                      <h3 className="text-xl font-semibold">Assistente Jurídico AI</h3>
                      <p className="text-muted-foreground">
                        Obtenha respostas imediatas através do nosso assistente inteligente especializado em questões jurídicas
                      </p>
                      <Button className="w-full mt-4">
                        Experimentar Assistente Inteligente
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
                      <h3 className="text-xl font-semibold">Especialista Humano</h3>
                      <p className="text-muted-foreground">
                        Agende uma consulta personalizada com um dos nossos especialistas jurídicos
                      </p>
                      <Button className="w-full mt-4">
                        Falar com um Especialista
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
                <CardTitle className="text-2xl">Sessão Agendada com Sucesso!</CardTitle>
                <p className="text-muted-foreground">
                  Sua consulta jurídica está confirmada para {selectedDate?.toLocaleDateString()} às {selectedTime}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg">Ajude o especialista a preparar sua consulta</h3>
                  <p className="text-sm text-muted-foreground">
                    Faça um pré-diagnóstico com nossa IA. Isso ajudará o especialista humano a entender melhor 
                    seu caso e preparar uma consulta mais eficaz quando chegar o momento da sessão.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Identifique rapidamente as áreas jurídicas relevantes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Organize suas questões e preocupações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Receba orientações preliminares instantaneamente</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/user/dashboard')}
                    className="flex-1"
                  >
                    Pular por Agora
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('prediagnostic-chat')}
                    className="flex-1"
                  >
                    Fazer Pré-Diagnóstico
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
                  ← Voltar
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Agendar com {selectedProvider?.name} - {selectedProvider?.specialty}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-h3 mb-3">Selecionar Data e Horário</h3>
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
          <div className="min-h-screen bg-soft-white">
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Confirmar Agendamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p><strong>Prestador:</strong> {selectedProvider?.name}</p>
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
                        Confirmar Sessão
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