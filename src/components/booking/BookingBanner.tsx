import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface BookingBannerProps {
  onBookSession: () => void;
}

export const BookingBanner = ({ onBookSession }: BookingBannerProps) => {
  const { t } = useTranslation('user');

  return (
    <div className="bg-primary/10 border-t border-primary/20 p-4 mt-auto">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <p className="text-sm font-medium text-foreground">
          {t('booking.banner.title')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('booking.banner.subtitle')}
        </p>
        <Button 
          onClick={onBookSession}
          className="w-full sm:w-auto"
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {t('booking.banner.action')}
        </Button>
      </div>
    </div>
  );
};
