import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MeetingTypeSelectionProps {
  onNext: (meetingType: 'virtual' | 'phone') => void;
  onBack: () => void;
}

export const MeetingTypeSelection = ({ onNext, onBack }: MeetingTypeSelectionProps) => {
  const { t } = useTranslation('user');
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'virtual' | 'phone' | null>(null);

  const handleContinue = () => {
    if (!selectedType) {
      toast({
        title: t('errors:title'),
        description: t('booking.meetingType.selectType'),
        variant: 'destructive',
      });
      return;
    }
    onNext(selectedType);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('booking.meetingType.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('booking.meetingType.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'virtual' ? 'border-primary border-2 bg-primary/5' : ''
          }`}
          onClick={() => setSelectedType('virtual')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">{t('booking.meetingType.virtual.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              {t('booking.meetingType.virtual.description')}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'phone' ? 'border-primary border-2 bg-primary/5' : ''
          }`}
          onClick={() => setSelectedType('phone')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">{t('booking.meetingType.phone.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              {t('booking.meetingType.phone.description')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('common:actions.back')}
        </Button>
        <Button onClick={handleContinue} disabled={!selectedType} className="flex-1">
          {t('booking.meetingType.continue')}
        </Button>
      </div>
    </div>
  );
};
