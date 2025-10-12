import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface BookingBannerProps {
  onBookSession: () => void;
}

export const BookingBanner = ({ onBookSession }: BookingBannerProps) => {
  return (
    <div className="bg-primary/10 border-t border-primary/20 p-4 mt-auto">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <p className="text-sm font-medium text-foreground">
          Pronto para agendar uma sessão?
        </p>
        <p className="text-xs text-muted-foreground">
          Conecte-se com um dos nossos especialistas certificados
        </p>
        <Button 
          onClick={onBookSession}
          className="w-full sm:w-auto"
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Sessão
        </Button>
      </div>
    </div>
  );
};
