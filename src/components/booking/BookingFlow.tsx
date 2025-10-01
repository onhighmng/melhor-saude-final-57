import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillarSelection from './PillarSelection';
import { mockProviders } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCalendar } from '@/components/ui/booking-calendar';
import { useToast } from '@/hooks/use-toast';

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
  const [currentStep, setCurrentStep] = useState<'pillar' | 'datetime' | 'confirmation'>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<BookingPillar | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MockProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handlePillarSelect = (pillar: BookingPillar) => {
    // Round-robin assignment logic using mock data
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
      // Simple round-robin: use index 0 for now (in real app, this would be stored/tracked)
      const assignedProvider = availableProviders[0];
      setSelectedPillar(pillar);
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
    
    // Navigate back to dashboard after booking
    setTimeout(() => {
      navigate('/user/dashboard');
    }, 2000);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'pillar':
        return <PillarSelection onPillarSelect={handlePillarSelect} />;
      
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
                        Confirmar Data e Hora
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
                        Confirmar Agendamento
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