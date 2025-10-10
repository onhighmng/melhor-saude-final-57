import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Especialista atribuído</h2>
        <p className="text-sm text-muted-foreground">Encontrámos o especialista ideal para si</p>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Correspondência encontrada</h3>
              <p className="text-sm text-muted-foreground">Conectamos você com nosso especialista</p>
            </div>
          </div>

          <div className="bg-background rounded-lg p-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Nosso especialista</h4>
              <p className="text-primary font-medium">{assignedProvider.specialty}</p>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm">{assignedProvider.rating}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                Profissional qualificado pronto para ajudar com suas necessidades
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="px-8">
          Selecionar data e hora
        </Button>
      </div>
    </div>
  );
};
