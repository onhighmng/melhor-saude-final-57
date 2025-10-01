import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import CalendarStep from './CalendarStep';
import SessionDetailsStep from './SessionDetailsStep';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FullscreenBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar: string;
  pillarName: string;
}

export default function FullscreenBookingModal({ 
  isOpen, 
  onClose, 
  pillar, 
  pillarName 
}: FullscreenBookingModalProps) {
  const navigate = useNavigate();
  const { sessionBalance } = useSessionBalance();
  const [step, setStep] = useState<'calendar' | 'details'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(50); // Default to 50 minutes
  const [objective, setObjective] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleNextToDetails = () => {
    if (selectedDate) {
      setStep('details');
    }
  };

  const handleBackToCalendar = () => {
    setStep('calendar');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleObjectiveChange = (newObjective: string) => {
    setObjective(newObjective);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Por favor selecione uma data e horário');
      return;
    }

    if (!sessionBalance?.hasActiveSessions) {
      toast.error('Não tem sessões restantes. Contacte o administrador.');
      return;
    }

    setIsBooking(true);
    
    try {
      // Create booking date
      const [hours, minutes] = selectedTime.split(':');
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // In real app, would call booking API with duration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Sessão confirmada com sucesso!');
      onClose();
      navigate('/user/dashboard');
    } catch (error) {
      toast.error('Erro ao confirmar sessão. Tente novamente.');
    } finally {
      setIsBooking(false);
    }
  };

  const resetModal = () => {
    setStep('calendar');
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedDuration(50);
    setObjective('');
    setIsBooking(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-gray-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {step === 'calendar' ? 'Escolher Data' : 'Detalhes da Sessão'}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-10 w-10 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto h-full">
              {step === 'calendar' && (
                <CalendarStep
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onNext={handleNextToDetails}
                  pillarName={pillarName}
                />
              )}
              
              {step === 'details' && selectedDate && (
                <SessionDetailsStep
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedDuration={selectedDuration}
                  objective={objective}
                  onTimeSelect={handleTimeSelect}
                  onDurationSelect={handleDurationSelect}
                  onObjectiveChange={handleObjectiveChange}
                  onConfirm={handleConfirm}
                  onBack={handleBackToCalendar}
                  isBooking={isBooking}
                  pillarName={pillarName}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}