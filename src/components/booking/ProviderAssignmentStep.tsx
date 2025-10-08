import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle2 } from 'lucide-react';
import { BookingPillar } from './BookingFlow';

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
  const { t } = useTranslation(['user', 'common']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('user:booking.directFlow.providerAssigned')}</h2>
        <p className="text-sm text-muted-foreground">{t('user:booking.directFlow.providerAssignedSubtitle')}</p>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">{t('user:booking.directFlow.matchFound')}</h3>
              <p className="text-sm text-muted-foreground">{t('user:booking.directFlow.matchFoundDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-6 bg-background rounded-lg p-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={assignedProvider.avatar_url} alt={assignedProvider.name} />
              <AvatarFallback>{assignedProvider.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h4 className="text-xl font-semibold mb-1">{assignedProvider.name}</h4>
              <p className="text-primary font-medium mb-3">{assignedProvider.specialty}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{assignedProvider.rating}</span>
                </div>
                <span>•</span>
                <span>{assignedProvider.experience}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                {t('user:booking.directFlow.providerExpertise', { pillar: t(`user:booking.directFlow.pillars.${pillar}.title`) })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="px-8">
          {t('user:booking.directFlow.selectDateTime')}
        </Button>
      </div>
    </div>
  );
};
