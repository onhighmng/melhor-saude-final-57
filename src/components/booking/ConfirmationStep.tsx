import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
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
  onBack,
  onConfirm,
  isConfirming = false
}: ConfirmationStepProps) => {
  const { t } = useTranslation(['user', 'common']);

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
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('user:booking.directFlow.confirmTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('user:booking.directFlow.confirmSubtitle')}</p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{t('user:booking.directFlow.sessionDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Provider Info */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <User className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.avatar_url} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{provider.name}</p>
                <p className="text-sm text-muted-foreground">{provider.specialty}</p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4 pb-6 border-b">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">{t('user:booking.directFlow.date')}</p>
                <p className="text-sm text-muted-foreground capitalize">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">{t('user:booking.directFlow.time')}</p>
                <p className="text-sm text-muted-foreground">{selectedTime}</p>
              </div>
            </div>
          </div>

          {/* Session Topic */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">{t('user:booking.directFlow.focusArea')}</p>
            <p className="text-sm text-muted-foreground">
              {t(`user:booking.directFlow.pillars.${pillar}.title`)} - {topic}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isConfirming}
          className="flex-1"
        >
          {t('common:actions.back')}
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1"
        >
          {isConfirming ? t('user:booking.directFlow.confirming') : t('user:booking.directFlow.confirmBooking')}
        </Button>
      </div>
    </div>
  );
};
