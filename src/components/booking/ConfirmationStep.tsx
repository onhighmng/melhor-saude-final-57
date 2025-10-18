import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle2, Video, Phone, ArrowLeft } from 'lucide-react';
import { BookingPillar } from './BookingFlow';
interface Provider {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string;
}

interface ConfirmationStepProps {
  pillar: BookingPillar;
  topic: string;
  provider: Provider;
  selectedDate: Date;
  selectedTime: string;
  meetingType?: 'virtual' | 'phone';
  onBack: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export const ConfirmationStep = ({
  pillar,
  topic,
  provider,
  selectedDate,
  selectedTime,
  meetingType = 'virtual',
  onBack,
  onConfirm,
  isConfirming = false
}: ConfirmationStepProps) => {
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1"></div>
        <div className="text-center flex-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirmar Agendamento</h2>
          <p className="text-sm text-muted-foreground">Reveja os detalhes da sua sessão antes de confirmar</p>
        </div>
        <div className="flex justify-end flex-1">
          <Button 
            variant="ghost" 
            onClick={onBack}
            disabled={isConfirming}
            className="flex items-center gap-2 text-gray-600 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Detalhes da Sessão</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Provider Info */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <User className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Nosso Especialista</p>
              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4 pb-6 border-b">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Data</p>
                <p className="text-sm text-muted-foreground capitalize">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Hora</p>
                <p className="text-sm text-muted-foreground">{selectedTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              {meetingType === 'virtual' ? (
                <Video className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              ) : (
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium mb-1">Formato</p>
                <p className="text-sm text-muted-foreground">
                  {meetingType === 'virtual' 
                    ? 'Videochamada Online' 
                    : 'Chamada Telefónica'}
                </p>
              </div>
            </div>
          </div>

          {/* Session Topic */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Área de Foco</p>
            <p className="text-sm text-muted-foreground">{topic}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onConfirm}
          disabled={isConfirming}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
        >
          {isConfirming ? 'A confirmar...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
};
