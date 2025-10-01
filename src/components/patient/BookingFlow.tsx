import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const BookingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
    professional: '',
    date: null as Date | null,
    time: ''
  });
  const { toast } = useToast();

  const locations = [
    'Maputo - Centro',
    'Maputo - Sommerschield',
    'Matola',
    'Beira',
    'Nampula'
  ];

  const specialties = [
    'Clínica Geral',
    'Cardiologia',
    'Dermatologia',
    'Ginecologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Pediatria',
    'Psicologia',
    'Urologia'
  ];

  const professionals = [];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    // Redirect to unified booking flow
    navigate('/user/book');
  };

  return (
    <Card className="bg-white/20 backdrop-blur-md border border-accent-sage/10 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-navy-blue text-center">
          Agendar Sessão
        </CardTitle>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step <= currentStep
                    ? "bg-vibrant-blue text-white"
                    : "bg-white/50 text-navy-blue/50"
                )}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-blue">
              Passo 1: Selecione o local preferido
            </h3>
            <Select value={bookingData.location} onValueChange={(value) => setBookingData({...bookingData, location: value})}>
              <SelectTrigger className="bg-white/50 border-accent-sage/20">
                <SelectValue placeholder="Local da consulta" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 2: Specialty */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-blue">
              Passo 2: Escolha a especialidade
            </h3>
            <Select value={bookingData.specialty} onValueChange={(value) => setBookingData({...bookingData, specialty: value})}>
              <SelectTrigger className="bg-white/50 border-accent-sage/20">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 3: Professional */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-blue">
              Passo 3: Selecione o profissional (opcional)
            </h3>
            <Select value={bookingData.professional} onValueChange={(value) => setBookingData({...bookingData, professional: value})}>
              <SelectTrigger className="bg-white/50 border-accent-sage/20">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer profissional disponível</SelectItem>
                {professionals.map((professional) => (
                  <SelectItem key={professional} value={professional}>
                    {professional}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 4: Date and Time */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-blue">
              Passo 4: Escolha data e horário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-navy-blue mb-2">Data:</p>
                <Calendar
                  mode="single"
                  selected={bookingData.date}
                  onSelect={(date) => setBookingData({...bookingData, date})}
                  disabled={(date) => date < new Date()}
                  className="bg-white/50 rounded-lg border border-accent-sage/20 p-3 pointer-events-auto"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-blue mb-2">Horário:</p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={bookingData.time === time ? "default" : "outline"}
                      onClick={() => setBookingData({...bookingData, time})}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-blue">
              Passo 5: Confirme os detalhes
            </h3>
            <div className="bg-white/30 rounded-lg p-4 space-y-2">
              <p><strong>Local:</strong> {bookingData.location}</p>
              <p><strong>Especialidade:</strong> {bookingData.specialty}</p>
              <p><strong>Profissional:</strong> {bookingData.professional || 'Qualquer disponível'}</p>
              <p><strong>Data:</strong> {bookingData.date?.toLocaleDateString()}</p>
              <p><strong>Horário:</strong> {bookingData.time}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="bg-white/20 backdrop-blur-md border-accent-sage/20"
          >
            Voltar
          </Button>
          
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !bookingData.location) ||
                (currentStep === 2 && !bookingData.specialty) ||
                (currentStep === 4 && (!bookingData.date || !bookingData.time))
              }
              className="bg-gradient-to-r from-accent-sky to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sky text-white"
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-accent-sage to-accent-sky hover:from-accent-sky hover:to-accent-sage text-white"
            >
              Agendar Sessão
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFlow;
