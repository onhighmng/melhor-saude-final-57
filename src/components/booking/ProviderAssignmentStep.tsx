import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { BookingPillar } from './BookingFlow';
import { useTranslation } from 'react-i18next';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string;
  rating: number;
  experience: string;
}

interface ProviderAssignmentStepProps {
  pillar: BookingPillar;
  assignedProvider: Provider;
  onNext: () => void;
}

export const ProviderAssignmentStep = ({ pillar, assignedProvider, onNext }: ProviderAssignmentStepProps) => {
  const { t } = useTranslation('user');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t('booking.providerAssignment.title') || 'Especialista Atribuído'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('booking.providerAssignment.subtitle') || 'Encontrámos o especialista ideal para si'}
        </p>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">
                {t('booking.providerAssignment.matchFound') || 'Correspondência encontrada'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('booking.providerAssignment.matchDescription') || 'Conectamos você com nosso especialista'}
              </p>
            </div>
          </div>

          <div className="bg-background rounded-lg p-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">
                {t('booking.providerAssignment.ourSpecialist') || 'Nosso especialista'}
              </h4>
              <p className="text-primary font-medium">{assignedProvider.specialty}</p>

              <p className="text-sm text-muted-foreground">
                {t('booking.providerAssignment.specialistMessage') || 'Profissional qualificado pronto para ajudar com suas necessidades'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="px-8">
          {t('booking.providerAssignment.selectDateTime') || 'Selecionar data e hora'}
        </Button>
      </div>
    </div>
  );
};
